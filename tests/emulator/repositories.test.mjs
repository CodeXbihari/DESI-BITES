import { before, after, beforeEach, afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signInAnonymously, signOut } from 'firebase/auth';
import { createWebAdapter } from '../../src/backend/firestore/adapter.web.ts';
import { buildRepositories } from '../../src/backend/firestore/repositories.ts';
import { environment, seed, target, webClient } from './helpers.mjs';
import { address, item, order, membership } from './fixtures.mjs';

let env, c;
before(async () => { env = await environment(); });
after(async () => { await env?.cleanup(); });
beforeEach(async () => { await seed(env); c = await webClient(); });
afterEach(async () => { await c?.close(); c = undefined; });

test('Web repository reuses the Emulator Auth session and initializes once', async () => {
  assert.equal(c.adapter.uid(), c.auth.currentUser.uid);
  assert.equal(createWebAdapter(c.app, target), c.adapter);
  await c.repositories.profile.save({ displayName: 'Synthetic', defaultAddressId: null });
  assert.equal((await c.repositories.profile.get()).id, c.auth.currentUser.uid);
  assert.throws(() => createWebAdapter(c.app, { ...target, firestorePort: 8181 }), /retarget/);
});
test('published menu repositories preserve fixture IDs/prices and exclude drafts', async () => {
  const items = await c.repositories.menu.list('shop-a');
  assert.deepEqual(items.map(x => x.id), ['fixture-item']);
  assert.equal(items[0].data.pricePaise, 13000);
  assert.equal(items[0].data.imageAssetKey, item.imageAssetKey);
  assert.equal((await c.repositories.menu.categories('shop-a')).length, 1);
});
test('default address validation and deletion work against Rules, not just demo state', async () => {
  const r = c.repositories;
  await assert.rejects(() => r.profile.save({ displayName: 'Synthetic', defaultAddressId: 'foreign-home' }), /Default address/);
  await r.addresses.save('home', address);
  await r.profile.save({ displayName: 'Synthetic', defaultAddressId: 'home' });
  assert.equal((await r.profile.get()).data.defaultAddressId, 'home');
  await r.addresses.remove('home');
  assert.equal((await r.profile.get()).data.defaultAddressId, null);
  assert.deepEqual(await r.addresses.list(), []);
});
test('only active Emulator membership permits limited menu updates; stale revisions fail', async () => {
  const r = c.repositories;
  await assert.rejects(() => r.menu.updateExisting('shop-a', 'fixture-item', { pricePaise: 14000 }, 1), /owner/);
  await env.withSecurityRulesDisabled(async ctx => {
    await setDoc(doc(ctx.firestore(), `shops/shop-a/members/${c.auth.currentUser.uid}`), membership);
  });
  await r.menu.updateExisting('shop-a', 'fixture-item', { pricePaise: 14000, available: false }, 1);
  const actual = (await getDoc(doc(c.db, 'shops/shop-a/menuItems/fixture-item'))).data();
  assert.equal(actual.pricePaise, 14000); assert.equal(actual.name, item.name); assert.equal(actual.revision, 2);
  await assert.rejects(() => r.menu.updateExisting('shop-a', 'fixture-item', { pricePaise: 15000 }, 1), /Stale/);
  await assert.rejects(() => r.menu.updateExisting('shop-a', 'fixture-item', { name: 'Changed' }, 2), /Protected/);
});
test('owner membership revocation blocks an existing repository instance', async () => {
  const path = `shops/shop-a/members/${c.auth.currentUser.uid}`;
  await env.withSecurityRulesDisabled(async ctx => { await setDoc(doc(ctx.firestore(), path), membership); });
  await c.repositories.menu.ownerList('shop-a');
  await env.withSecurityRulesDisabled(async ctx => { await setDoc(doc(ctx.firestore(), path), { ...membership, active: false }); });
  await assert.rejects(() => c.repositories.menu.ownerList('shop-a'), /owner/);
});
test('concurrent owner edits at the same revision allow exactly one committed update', { timeout: 30000 }, async () => {
  await env.withSecurityRulesDisabled(async ctx => {
    await setDoc(doc(ctx.firestore(), `shops/shop-a/members/${c.auth.currentUser.uid}`), membership);
  });
  const results = await Promise.allSettled([
    c.repositories.menu.updateExisting('shop-a', 'fixture-item', { pricePaise: 14000 }, 1),
    c.repositories.menu.updateExisting('shop-a', 'fixture-item', { pricePaise: 15000 }, 1),
  ]);
  assert.equal(results.filter(x => x.status === 'fulfilled').length, 1);
  const rejected = results.find(x => x.status === 'rejected');
  assert.ok(
    rejected.reason?.code === 'permission-denied'
      || rejected.reason?.message === 'Stale or missing menu item. Reload before editing.',
    'The losing edit must reject with a stale-revision error or permission-denied.',
  );
  const actual = (await getDoc(doc(c.db, 'shops/shop-a/menuItems/fixture-item'))).data();
  assert.equal(actual.revision, 2);
  assert.equal(actual.pricePaise, results[0].status === 'fulfilled' ? 14000 : 15000);
  const { pricePaise, revision, updatedAt, ...protectedFields } = actual;
  const { pricePaise: initialPrice, revision: initialRevision, updatedAt: initialUpdatedAt, ...initialProtectedFields } = item;
  assert.deepEqual(protectedFields, initialProtectedFields);
});
test('Rules deny owner edits revoked after the repository membership precheck', { timeout: 30000 }, async () => {
  const path = `shops/shop-a/members/${c.auth.currentUser.uid}`;
  await env.withSecurityRulesDisabled(async ctx => { await setDoc(doc(ctx.firestore(), path), membership); });
  let signalEntered, release;
  const entered = new Promise(resolve => { signalEntered = resolve; });
  const gate = new Promise(resolve => { release = resolve; });
  const repositories = buildRepositories({
    ...c.adapter,
    async transaction(run) {
      signalEntered(); // The repository's membership precheck has succeeded.
      await gate;
      return c.adapter.transaction(run);
    },
  });
  const outcome = repositories.menu.updateExisting('shop-a', 'fixture-item', { pricePaise: 14000 }, 1)
    .then(() => ({ error: null }), error => ({ error }));
  await Promise.race([entered, outcome.then(() => { throw new Error('Edit completed before the transaction gate.'); })]);
  try {
    await env.withSecurityRulesDisabled(async ctx => { await setDoc(doc(ctx.firestore(), path), { ...membership, active: false }); });
  } finally { release(); }
  const result = await outcome;
  assert.equal(result.error?.code, 'permission-denied');
  const actual = (await getDoc(doc(c.db, 'shops/shop-a/menuItems/fixture-item'))).data();
  assert.equal(actual.revision, 1); assert.equal(actual.pricePaise, item.pricePaise);
});
test('read-only order repositories scope and paginate current-user unpaid orders', async () => {
  const uid = c.auth.currentUser.uid;
  await env.withSecurityRulesDisabled(async ctx => {
    await setDoc(doc(ctx.firestore(), 'orders/own-a'), { ...order, customerUid: uid });
    await setDoc(doc(ctx.firestore(), 'orders/own-b'), { ...order, customerUid: uid });
  });
  const first = await c.repositories.orders.mine('shop-a', { limit: 1 });
  assert.equal(first.length, 1); assert.equal(first[0].data.payment.status, 'unpaid');
  const second = await c.repositories.orders.mine('shop-a', { limit: 1, afterId: first[0].id });
  assert.equal(second.length, 1); assert.notEqual(second[0].id, first[0].id);
  assert.equal(c.repositories.orders.create, undefined);
});
test('logout and a new Emulator sign-in cannot reuse the previous customer profile', async () => {
  await c.repositories.profile.save({ displayName: 'First customer', defaultAddressId: null });
  const previousUid = c.auth.currentUser.uid;
  await signOut(c.auth);
  await assert.rejects(() => c.repositories.profile.get(), /authentication/);
  await signInAnonymously(c.auth);
  assert.notEqual(c.auth.currentUser.uid, previousUid);
  assert.equal(await c.repositories.profile.get(), null);
});
