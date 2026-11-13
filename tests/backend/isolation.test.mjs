import test from 'node:test';
import assert from 'node:assert/strict';
import { createRepositories } from '../../src/backend/createRepositories.ts';
import { requireEmulatorTarget, assertMatchingProject } from '../../src/config/firebaseTarget.ts';
import { buildRepositories } from '../../src/backend/firestore/repositories.ts';

const target = { mode: 'emulator', development: true, projectId: 'demo-desiibites-stage1', host: '127.0.0.1', authPort: 9099, firestorePort: 8080 };
const address = { label: 'Home', addressLine: 'Synthetic address', area: 'Area', city: 'City', pincode: '560001', deliveryInstructions: '' };

test('mock mode never calls the Firebase adapter loader, even with missing or hostile target config', async () => {
  let calls = 0;
  const loader = async () => { calls++; throw new Error('Must not load a Firebase adapter.'); };
  for (const configured of [undefined, { mode: 'production' }]) {
    const demo = await createRepositories({ authMode: 'mock', platform: 'android', target: configured }, loader);
    assert.equal(demo.kind, 'demo'); await demo.profile.save({ displayName: 'Demo', defaultAddressId: null });
    assert.equal((await demo.profile.get()).data.displayName, 'Demo');
  }
  assert.equal(calls, 0);
});
test('demo instances are private and have no order/history/member write API', async () => {
  const a = await createRepositories({ authMode: 'mock', platform: 'web' });
  const b = await createRepositories({ authMode: 'mock', platform: 'web' });
  await a.profile.save({ displayName: 'A', defaultAddressId: null });
  assert.equal(await b.profile.get(), null);
  assert.deepEqual(Object.keys(a.orders).sort(), ['forShop', 'history', 'mine']);
  assert.deepEqual(Object.keys(a.membership), ['get']);
  assert.equal(a.orders.create, undefined);
});
test('missing or unsafe Emulator configuration fails before loading Firebase', async () => {
  let calls = 0;
  for (const configured of [undefined, null, {}, { ...target, mode: 'production' }, { ...target, development: false }, { ...target, host: 'example.com' }, { ...target, host: '127.0.0.1.evil' }, { ...target, projectId: 'other-live-project' }, { ...target, authPort: target.firestorePort }]) {
    await assert.rejects(() => createRepositories({ authMode: 'firebase', platform: 'web', target: configured }, async () => { calls++; throw new Error('Must not load.'); }));
  }
  assert.equal(calls, 0);
});
test('targets are immutable, project-matched and platform-specific', () => {
  assert.ok(Object.isFrozen(requireEmulatorTarget(target, 'web')));
  assert.doesNotThrow(() => requireEmulatorTarget({ ...target, host: '10.0.2.2' }, 'android'));
  assert.throws(() => requireEmulatorTarget({ ...target, host: '10.0.2.2' }, 'web'));
  assert.throws(() => assertMatchingProject('production-other', target));
});
test('default addresses must exist in the current demo customer collection and deletes clear defaults atomically', async () => {
  const a = await createRepositories({ authMode: 'mock', platform: 'web', demoUid: 'customer-a' });
  await assert.rejects(() => a.profile.save({ displayName: 'A', defaultAddressId: 'missing' }), /Default address/);
  await a.addresses.save('home', address);
  await a.profile.save({ displayName: 'A', defaultAddressId: 'home' });
  await a.addresses.remove('home');
  assert.equal((await a.profile.get()).data.defaultAddressId, null);
  assert.deepEqual(await a.addresses.list(), []);
});
test('repository scope derives from the SDK UID, rejects anonymous operations and checks owner membership', async () => {
  let uid = null; const requested = [];
  const store = { uid: () => uid, get: async p => { requested.push(p); return null; }, list: async (p, q) => { requested.push([p, q]); return []; }, serverTimestamp: () => ({}), transaction: async () => { throw new Error('Not expected'); } };
  const r = buildRepositories(store);
  await assert.rejects(() => r.menu.list('shop-a'), /authentication/);
  uid = 'customer-a'; await r.orders.mine('shop-a');
  assert.deepEqual(requested.at(-1)[1].filters, [['customerUid', 'customer-a'], ['shopId', 'shop-a']]);
  await assert.rejects(() => r.menu.updateExisting('shop-a', 'fixture', { pricePaise: 1 }, 1), /owner/);
  assert.equal(requested.at(-1), 'shops/shop-a/members/customer-a');
});
test('existing repository instances do not retain the previous Firebase UID', async () => {
  let uid = 'customer-a'; const paths = [];
  const r = buildRepositories({ uid: () => uid, get: async p => { paths.push(p); return null; }, list: async () => [], serverTimestamp: () => ({}), transaction: async () => {} });
  await r.profile.get(); uid = 'customer-b'; await r.profile.get(); uid = null;
  await assert.rejects(() => r.profile.get(), /authentication/);
  assert.deepEqual(paths, ['users/customer-a', 'users/customer-b']);
});
