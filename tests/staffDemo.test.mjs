import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  allowedStaffPath, checkCredentials, createStaffData, deliveryCounts, generateDemoPin,
  progressOrder, readStaffPath, removeDeliveryPartner, saveDeliveryPartner,
} from '../src/features/staff/staffDemo.ts';

test('demo credentials identify the correct role and reject invalid logins', () => {
  const data = createStaffData();
  assert.equal(checkCredentials(data, '9999999999', '123456').role, 'admin');
  assert.equal(checkCredentials(data, '8888888888', '654321').role, 'delivery');
  assert.throws(() => checkCredentials(data, '7777777777', '456789'), /inactive/);
  assert.throws(() => checkCredentials(data, '9999999999', '654321'), /did not match/);
  assert.throws(() => checkCredentials(data, '9876543210', '123456'), /did not match/);
  assert.throws(() => checkCredentials(data, '123', '123456'), /10-digit/);
  assert.throws(() => checkCredentials(data, '9999999999', '123'), /6-digit/);
});

test('staff routing guards protected paths and redirects login by role', () => {
  assert.equal(readStaffPath('/admin/delivery/'), '/admin/delivery');
  assert.equal(readStaffPath('/admin/orders'), '/admin/dashboard');
  assert.equal(readStaffPath('/delivery/dashboard'), '/delivery/dashboard');
  assert.equal(readStaffPath('/'), null);
  assert.equal(allowedStaffPath('/admin/delivery'), '/login');
  assert.equal(allowedStaffPath('/admin/delivery', 'delivery'), '/delivery/dashboard');
  assert.equal(allowedStaffPath('/delivery/dashboard', 'admin'), '/admin/dashboard');
  assert.equal(allowedStaffPath('/admin/delivery', 'admin'), '/admin/delivery');
  assert.equal(allowedStaffPath('/login', 'delivery'), '/delivery/dashboard');
  assert.equal(allowedStaffPath('/login', 'admin'), '/admin/dashboard');
});

test('a partner can sign in after creation, PIN reset, and reactivation', () => {
  const data = createStaffData();
  const draft = { name: '  Neha Rao  ', phone: '9876543210', pin: '012345', active: true };
  assert.throws(() => saveDeliveryPartner(data, 'new', { ...draft, phone: '9999999999' }, false), /already registered/);
  assert.throws(() => saveDeliveryPartner(data, 'new', { ...draft, name: ' ' }, false), /full name/);
  let updated = saveDeliveryPartner(data, 'new', draft, false);
  assert.equal(checkCredentials(updated, draft.phone, '012345').name, 'Neha Rao');
  updated = saveDeliveryPartner(updated, 'new', { ...draft, pin: '000123', active: false }, true);
  assert.throws(() => checkCredentials(updated, draft.phone, '012345'), /did not match/);
  assert.throws(() => checkCredentials(updated, draft.phone, '000123'), /inactive/);
  updated = saveDeliveryPartner(updated, 'new', { ...draft, pin: '000123' }, true);
  assert.equal(checkCredentials(updated, draft.phone, '000123').role, 'delivery');
  updated = removeDeliveryPartner(updated, 'new');
  assert.throws(() => checkCredentials(updated, draft.phone, '000123'), /did not match/);
  assert.throws(() => removeDeliveryPartner(updated, 'demo-admin'), /no longer available/);
  assert.match(generateDemoPin(), /^\d{6}$/);
});

test('only the assigned partner advances a delivery through successive statuses', () => {
  let data = createStaffData();
  const counts = () => deliveryCounts(data.orders.filter(order => order.partnerId === 'demo-partner'));
  assert.throws(() => progressOrder(data, 'demo-paused', 'DB-1042', 'assigned'), /no longer available/);
  assert.throws(() => progressOrder(data, 'demo-partner', 'DB-1042', 'accepted'), /no longer available/);
  assert.deepEqual(counts(), { assigned: 3, pickups: 2, out: 1, delivered: 1 });
  for (const status of ['assigned', 'accepted', 'picked-up', 'out-for-delivery']) {
    data = progressOrder(data, 'demo-partner', 'DB-1042', status);
  }
  assert.deepEqual(counts(), { assigned: 2, pickups: 1, out: 1, delivered: 2 });
  assert.throws(() => progressOrder(data, 'demo-partner', 'DB-1042', 'delivered'), /no longer available/);
  const removed = removeDeliveryPartner(data, 'demo-partner');
  assert.equal(removed.orders.length, data.orders.length);
  assert.ok(removed.orders.every(order => order.partnerId === null));
});
