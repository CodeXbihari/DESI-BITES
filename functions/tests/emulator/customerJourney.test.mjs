import { before, after, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import { signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { environment, webClient } from '../../../tests/emulator/helpers.mjs';
import { fixtureDocuments, address } from '../../../tests/emulator/fixtures.mjs';
import { createCustomerOrderApi } from '../../../src/services/customerOrders.ts';
import { createCustomerOrderSession } from '../../../src/services/customerOrderSession.ts';
let env;
before(async () => { assert.equal(process.env.FUNCTIONS_EMULATOR_HOST, '127.0.0.1:5001'); env = await environment(); });
after(async () => { await env?.cleanup(); });
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async c => {
    for (const [path, data] of fixtureDocuments().filter(([p]) => p.startsWith('shops/') || p.startsWith('users/'))) await setDoc(doc(c.firestore(), path), path === 'shops/shop-a' ? { ...data, acceptsOrders: true } : data);
  });
});
async function setup(intercept = async (_name, value) => value) {
  const c = await webClient(), uid = c.auth.currentUser.uid;
  const functions = getFunctions(c.app, 'us-central1'); connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  const keys = [], cleared = [];
  const api = createCustomerOrderApi(uid, () => c.auth.currentUser?.uid ?? null, c.repositories, async (name, data) => {
    if (name === 'confirmCustomerOrder') keys.push(data.submissionKey);
    return intercept(name, (await httpsCallable(functions, name)(data)).data, c);
  }, randomUUID, 'shop-a');
  let pending = null;
  const session = createCustomerOrderSession(uid, () => c.auth.currentUser?.uid ?? null, api,
    { get: async () => pending, set: async value => { pending = value; }, clear: async () => { pending = null; } }, order => cleared.push(order.id));
  await session.start();
  return { c, uid, api, session, keys, cleared, close: async () => { session.dispose(); await c.close(); } };
}
function draft(uid, fulfillment = 'pickup') {
  return { key: fulfillment, cart: { uid, version: 1, instance: 'test-runtime' }, input: { shopId: 'shop-a', items: [{ menuItemId: 'fixture-item', quantity: 2 }], couponCode: null,
    ...(fulfillment === 'pickup' ? { fulfillment, addressId: null } : { fulfillment, addressId: 'home' }) } };
}
test('customer controller and typed transport perform pickup/delivery, persisted history and owned details over real callables', async () => {
  for (const fulfillment of ['pickup', 'delivery']) {
    const f = await setup();
    try {
      if (fulfillment === 'delivery') await setDoc(doc(f.c.db, `users/${f.uid}/addresses/home`), { ...address, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      await f.session.quote(draft(f.uid, fulfillment)); assert.equal(f.session.getSnapshot().phase, 'review'); assert.equal(f.cleared.length, 0);
      await f.session.confirm(); const order = f.session.getSnapshot().success;
      assert.ok(order); assert.equal(order.data.fulfillment, fulfillment); assert.deepEqual(order.data.payment, { status: 'unpaid' });
      assert.equal(f.cleared.length, 1); await f.session.history(); assert.equal(f.session.getSnapshot().orders[0].id, order.id);
      await f.session.loadOrder(order.id); assert.equal(f.session.getSnapshot().detail.id, order.id);
      const second = await setup();
      try { await assert.rejects(second.api.get(order.id)); } finally { await second.close(); }
    } finally { await f.close(); }
  }
});
test('lost confirmation response retries the actual persisted submission key and returns the same backend order', async () => {
  let lost = true;
  const f = await setup(async (name, value) => {
    if (name === 'confirmCustomerOrder' && lost) { lost = false; throw Object.assign(new Error('Simulated lost response after server commit'), { code: 'functions/deadline-exceeded' }); }
    return value;
  });
  try {
    await f.session.quote(draft(f.uid)); await f.session.confirm(); assert.equal(f.session.getSnapshot().phase, 'uncertain'); assert.equal(f.cleared.length, 0);
    await f.session.confirm(); assert.equal(f.session.getSnapshot().phase, 'success'); assert.equal(f.keys.length, 2); assert.equal(f.keys[0], f.keys[1]);
    assert.equal((await f.api.history()).length, 1);
  } finally { await f.close(); }
});
test('a Firebase sign-out before delivery of a committed response prevents stale success and cart clearing', async () => {
  const f = await setup(async (name, value, c) => { if (name === 'confirmCustomerOrder') await signOut(c.auth); return value; });
  try { await f.session.quote(draft(f.uid)); await f.session.confirm(); assert.equal(f.session.getSnapshot().success, null); assert.equal(f.cleared.length, 0); }
  finally { await f.close(); }
});
test('local browser seeding preserves all 122 catalog items and refuses to overwrite an existing shop', async () => {
  const cwd = fileURLToPath(new URL('../../../', import.meta.url));
  const run = () => spawnSync(process.execPath, ['--experimental-strip-types', 'scripts/seed_customer_emulator.mjs'], { cwd, encoding: 'utf8', env: { ...process.env, GCLOUD_PROJECT: 'demo-desiibites-stage1' } });
  const first = run(); assert.equal(first.status, 0, first.stderr); assert.match(first.stdout, /Created 122 menu items/);
  const c = await webClient();
  try {
    const items = await c.repositories.menu.list('demo-desi-bites');
    const source = JSON.parse(readFileSync(new URL('../../../src/data/restaurantMenu.json', import.meta.url), 'utf8'));
    assert.equal(items.length, 122);
    for (const item of source) {
      const stored = items.find(value => value.id === item.id); assert.ok(stored);
      assert.equal(stored.data.name, item.name); assert.equal(stored.data.pricePaise, item.price * 100); assert.equal(stored.data.imageAssetKey, item.image);
    }
    const again = run(); assert.notEqual(again.status, 0);
    assert.equal((await c.repositories.menu.list('demo-desi-bites')).length, 122);
  } finally { await c.close(); }
});
