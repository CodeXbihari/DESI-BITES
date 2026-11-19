import test from 'node:test';
import assert from 'node:assert/strict';
import { HttpsError } from 'firebase-functions/v2/https';
import { createAdminHandler, validateAdminMenuPatch, validateAdminTransition } from '../src/adminService.ts';

test('Admin status progression permits only the next kitchen state', () => {
  assert.equal(validateAdminTransition('placed', 'preparing'), 'preparing');
  assert.equal(validateAdminTransition('preparing', 'packed'), 'packed');
  assert.equal(validateAdminTransition('packed', 'food_ready'), 'food_ready');
  for (const [from, to] of [['placed', 'packed'], ['preparing', 'food_ready'], ['food_ready', 'placed']]) {
    assert.throws(() => validateAdminTransition(from, to), HttpsError);
  }
});

test('Admin menu patches accept editable fields and reject IDs, images, publication and ordering', () => {
  assert.deepEqual(validateAdminMenuPatch({ pricePaise: 1250, available: false }), { pricePaise: 1250, available: false });
  assert.deepEqual(validateAdminMenuPatch({ name: 'Masala dosa', description: 'Crisp', isVeg: true, availabilityNote: 'Evenings', categoryId: 'breakfast' }),
    { name: 'Masala dosa', description: 'Crisp', isVeg: true, availabilityNote: 'Evenings', categoryId: 'breakfast' });
  for (const field of ['imageAssetKey', 'published', 'sortOrder', 'revision', 'id', 'currency']) {
    assert.throws(() => validateAdminMenuPatch({ [field]: 'changed' }));
  }
  assert.throws(() => validateAdminMenuPatch({ pricePaise: 0 }));
  assert.throws(() => validateAdminMenuPatch({ available: 'false' }));
});

test('customers without active owner membership are denied before shop or order access', async () => {
  const paths = [];
  const db = { doc(path) { paths.push(path); return { async get() { return { exists: false }; } }; } };
  const handler = createAdminHandler(db, async () => { throw new Error('must not be called'); });
  await assert.rejects(handler({ auth: { uid: 'customer-1' }, data: { op: 'bootstrap', shopId: 'demo-shop', period: 'all' } }),
    error => error instanceof HttpsError && error.code === 'permission-denied');
  assert.deepEqual(paths, ['shops/demo-shop/members/customer-1']);
});

test('inactive owner memberships are denied before shop data is read', async () => {
  const paths = [];
  const db = { doc(path) { paths.push(path); return { async get() { return {
    exists: true,
    data: () => ({ role: 'owner', active: false, grantedBy: 'operator-1', grantedAt: { seconds: 1, nanoseconds: 0 } }),
  }; } }; } };
  const handler = createAdminHandler(db, async () => { throw new Error('must not be called'); });
  await assert.rejects(handler({ auth: { uid: 'owner-1' }, data: { op: 'access', shopId: 'demo-shop' } }),
    error => error instanceof HttpsError && error.code === 'permission-denied');
  assert.deepEqual(paths, ['shops/demo-shop/members/owner-1']);
});

test('concurrent status requests serialize and only the winning next state is recorded', async () => {
  const stamp = { seconds: 1, nanoseconds: 0 };
  const order = { shopId: 'demo-shop', customerUid: 'customer-1', items: [{ menuItemId: 'dish', nameSnapshot: 'Dish', imageAssetKey: 'dish.jpg', unitPricePaise: 100, quantity: 1, lineTotalPaise: 100, menuRevision: 1 }], currency: 'INR', subtotalPaise: 100, discountPaise: 0, deliveryFeePaise: 0, totalPaise: 100, status: 'placed', statusVersion: 1, payment: { status: 'unpaid' }, fulfillment: 'pickup', addressSnapshot: null, createdAt: stamp, updatedAt: stamp };
  const member = { role: 'owner', active: true, grantedBy: 'operator', grantedAt: stamp };
  const history = new Map(); let queue = Promise.resolve();
  const ref = path => ({ path, id: path.split('/').at(-1), async get() { return { exists: path === 'shops/demo-shop/members/owner-1', data: () => member }; }, collection(name) { return ref(`${path}/${name}`); }, doc(id) { return ref(`${path}/${id}`); } });
  const orderRef = ref('orders/order-1');
  const db = {
    doc: ref,
    runTransaction(callback) {
      const run = queue.then(async () => {
        const updates = [], creates = [];
        const tx = {
          async get(target) {
            if (target.path === 'shops/demo-shop/members/owner-1') return { exists: true, data: () => member };
            if (target.path === 'orders/order-1') return { exists: true, id: 'order-1', data: () => order };
            if (target.path.startsWith('orders/order-1/statusHistory/')) {
              const value = history.get(target.path);
              return { exists: Boolean(value), id: target.id, data: () => value };
            }
            throw new Error(`Unexpected transaction read ${target.path}`);
          },
          update(target, patch) { updates.push([target.path, patch]); },
          create(target, value) { creates.push([target.path, value]); },
        };
        const result = await callback(tx);
        for (const [, patch] of updates) Object.assign(order, patch);
        for (const [path, value] of creates) history.set(path, value);
        return result;
      });
      queue = run.catch(() => {});
      return run;
    },
  };
  const handler = createAdminHandler(db, async () => ({}));
  const request = status => handler({ auth: { uid: 'owner-1' }, data: { op: 'status', shopId: 'demo-shop', orderId: 'order-1', expectedVersion: 1, status } });
  const results = await Promise.allSettled([request('preparing'), request('packed')]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1, JSON.stringify(results.map(result => result.status === 'rejected' ? { code: result.reason.code, message: result.reason.message } : result.value)));
  const rejected = results.find(result => result.status === 'rejected');
  assert.equal(rejected.reason.code, 'aborted');
  assert.equal(order.status, 'preparing');
  assert.equal(order.statusVersion, 2);
  assert.equal(history.size, 1);
});
