import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdminApiForSession, DEMO_ADMIN_SHOP_ID } from '../src/features/admin/adminBackend.web.ts';

test('Admin API binds every callable request to the Firebase session UID and known shop', async () => {
  let uid = 'owner-1'; const calls = [];
  const api = createAdminApiForSession('owner-1', () => uid, async input => { calls.push(input); return { role: 'owner' }; });
  await api.access();
  assert.deepEqual(calls[0], { shopId: DEMO_ADMIN_SHOP_ID, op: 'access' });
  uid = 'customer-2';
  await assert.rejects(api.orders(), /sign-in changed/i);
  assert.equal(calls.length, 1);
});

test('Admin API sends only supported status and existing-record patch operations', async () => {
  const calls = [];
  const api = createAdminApiForSession('owner-1', () => 'owner-1', async input => { calls.push(input); return {}; });
  await api.status('order_1', 3, 'food_ready');
  await api.menu({ id: 'menu_1', data: { revision: 4 } }, { available: false });
  await api.category({ id: 'cat_1', data: { updatedAt: { seconds: 5, nanoseconds: 0 } } }, { isActive: false });
  assert.deepEqual(calls.map(({ op }) => op), ['status', 'menu', 'category']);
  assert.equal(calls[0].expectedVersion, 3);
  assert.deepEqual(calls[1].patch, { available: false });
  assert.deepEqual(calls[2].expectedUpdatedAt, { seconds: 5, nanoseconds: 0 });
  assert.ok(calls.every(call => call.shopId === DEMO_ADMIN_SHOP_ID));
});
