import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRepositories } from '../../src/backend/firestore/repositories.ts';
import { createDemoRepositories } from '../../src/backend/demoRepositories.ts';
import { id, validateAddress, validateHistory } from '../../src/backend/validation.ts';

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}
const time = { seconds: 1, nanoseconds: 0 };
const address = { label: 'Home', addressLine: 'Synthetic address', area: 'Test area', city: 'Test city', pincode: '560001', deliveryInstructions: '' };
const history = { fromStatus: null, toStatus: 'placed', actorUid: 'customer-a', actorRole: 'customer', statusVersion: 1, createdAt: time };
const order = {
  shopId: 'shop-a', customerUid: 'customer-a', currency: 'INR',
  items: [{ menuItemId: 'fixture-item', nameSnapshot: 'Synthetic dish', imageAssetKey: 'fixture.jpg', unitPricePaise: 13000, quantity: 1, lineTotalPaise: 13000, menuRevision: 1 }],
  subtotalPaise: 13000, discountPaise: 0, deliveryFeePaise: 0, totalPaise: 13000,
  status: 'placed', statusVersion: 1, payment: { status: 'unpaid' },
  fulfillment: 'pickup', addressSnapshot: null, createdAt: time, updatedAt: time,
};
const item = { name: 'Synthetic dish', categoryId: 'fixture-category', pricePaise: 13000, currency: 'INR', imageAssetKey: 'fixture.jpg', description: '', availabilityNote: '', isVeg: true, available: true, published: true, sortOrder: 0, revision: 1, createdAt: time, updatedAt: time };
const cases = [
  { name: 'addresses', path: 'users/customer-a/addresses', run: r => r.addresses.list(), row: { id: 'home', data: { ...address, createdAt: time, updatedAt: time } } },
  { name: 'customer orders', path: 'orders', run: r => r.orders.mine('shop-a'), row: { id: 'fixture-order', data: order } },
  { name: 'shop orders', path: 'orders', run: r => r.orders.forShop('shop-a'), row: { id: 'fixture-order', data: order } },
  { name: 'order history', path: 'orders/fixture-order/statusHistory', run: r => r.orders.history('fixture-order'), row: { id: 'initial', data: history } },
  { name: 'owner menu drafts', path: 'shops/shop-a/menuItems', run: r => r.menu.ownerList('shop-a'), row: { id: 'fixture-item', data: item } },
  { name: 'published menu', path: 'shops/shop-a/menuItems', run: r => r.menu.list('shop-a'), row: { id: 'fixture-item', data: item } },
  { name: 'categories', path: 'shops/shop-a/menuCategories', run: r => r.menu.categories('shop-a'), row: { id: 'fixture-category', data: { name: 'Synthetic category', isActive: true, sortOrder: 0, imageAssetKey: 'fixture.jpg', createdAt: time, updatedAt: time } } },
];

for (const scenario of cases) {
  for (const nextUid of ['customer-b', null]) {
    test(`pending ${scenario.name}: rejects after ${nextUid ? 'account switch' : 'logout'} before response completion`, async () => {
      let uid = 'customer-a'; const entered = deferred(), response = deferred();
      const r = buildRepositories({
        uid: () => uid,
        get: async () => ({ role: 'owner', active: true }),
        list: async path => { entered.resolve(path); return response.promise; },
        serverTimestamp() { throw new Error('No writes expected.'); },
        async transaction() { throw new Error('No writes expected.'); },
      });
      const pending = scenario.run(r);
      assert.equal(await entered.promise, scenario.path);
      // The request really started as A and is still unresolved at this point.
      uid = nextUid;
      response.resolve([scenario.row]);
      await assert.rejects(pending, /Authentication changed during request/);
    });
  }
  test(`pending ${scenario.name}: returns valid results when the same account remains signed in`, async () => {
    const entered = deferred(), response = deferred();
    const r = buildRepositories({ uid: () => 'customer-a', get: async () => ({ role: 'owner', active: true }), list: async () => { entered.resolve(); return response.promise; }, serverTimestamp() {}, async transaction() {} });
    const pending = scenario.run(r); await entered.promise; response.resolve([scenario.row]);
    assert.deepEqual(await pending, [scenario.row]);
  });
}
for (const [name, run] of [['shop orders', r => r.orders.forShop('shop-a')], ['owner menu', r => r.menu.ownerList('shop-a')]]) {
  test(`${name}: account switch during membership precheck never starts the private list`, async () => {
    let uid = 'owner-a', lists = 0;
    const entered = deferred(), response = deferred();
    const r = buildRepositories({ uid: () => uid, get: async path => { entered.resolve(path); return response.promise; }, list: async () => { lists++; return []; }, serverTimestamp() {}, async transaction() {} });
    const pending = run(r);
    assert.equal(await entered.promise, 'shops/shop-a/members/owner-a');
    uid = 'owner-b'; response.resolve({ role: 'owner', active: true });
    await assert.rejects(pending, /Authentication changed/); assert.equal(lists, 0);
  });
}

test('address IDs accept exactly the allowed ASCII format and reject malformed IDs before any transaction', async () => {
  const valid = ['A', 'home_1-A', 'x'.repeat(128)];
  const invalid = ['', 'home.address', 'with space', 'नाम', '..', 'users/other', 'x'.repeat(129), 'home\n'];
  const demo = createDemoRepositories('customer-a');
  for (const value of valid) { assert.equal(id(value), value); await demo.addresses.save(value, address); }
  assert.deepEqual((await demo.addresses.list()).map(x => x.id).sort(), valid.slice().sort());
  let transactions = 0;
  const r = buildRepositories({ uid: () => 'customer-a', get: async () => null, list: async () => [], serverTimestamp() {}, async transaction() { transactions++; } });
  for (const value of invalid) {
    assert.throws(() => id(value), /Invalid document ID/);
    await assert.rejects(() => r.addresses.save(value, address), /Invalid document ID/);
  }
  assert.equal(transactions, 0);
});
test('address labels require primitive strings and never invoke coercion', () => {
  for (const label of ['Home', 'Work', 'Other']) assert.equal(validateAddress({ ...address, label }).label, label);
  for (const label of [['Home'], new String('Home'), { toString() { throw new Error('Must not coerce'); } }, 1, true, null, undefined, Symbol('Home')]) {
    assert.throws(() => validateAddress({ ...address, label }), /Invalid address label/);
  }
});
test('history actor roles require primitive strings and never invoke coercion', () => {
  for (const actorRole of ['customer', 'owner', 'system']) assert.doesNotThrow(() => validateHistory({ ...history, actorRole }));
  for (const actorRole of [['owner'], new String('owner'), { toString() { throw new Error('Must not coerce'); } }, 1, true, null, undefined, Symbol('owner')]) {
    assert.throws(() => validateHistory({ ...history, actorRole }), /Invalid actor role/);
  }
});
test('owner edit rejects a stale expected revision when the SDK retries after a concurrent commit', async () => {
  let attempt = 0; const staged = [];
  const r = buildRepositories({
    uid: () => 'owner-a', get: async () => ({ role: 'owner', active: true }), list: async () => [],
    serverTimestamp: () => time,
    async transaction(run) {
      const tx = () => ({ get: async () => ({ ...item, revision: ++attempt }), update: (_path, data) => { staged.push(data); }, set() {}, delete() {} });
      await run(tx()); // Initial attempt is discarded by the SDK after contention.
      return run(tx()); // A competing committed update has advanced revision to 2.
    },
  });
  await assert.rejects(() => r.menu.updateExisting('shop-a', 'fixture-item', { pricePaise: 14000 }, 1), /Stale/);
  assert.equal(attempt, 2); assert.equal(staged.length, 1);
});
