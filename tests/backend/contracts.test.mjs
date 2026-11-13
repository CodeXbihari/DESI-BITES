import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { validateAddress, validateAddressDocument, validateCategory, validateMembership, validateOrder, validateOrderStatus, validateOwnerMenuPatch, validateProfile, validateProfileDocument, validateShop, id } from '../../src/backend/validation.ts';
import { menuEntity, orderEntity, normalize } from '../../src/backend/firestore/mappers.ts';

const time = { seconds: 1, nanoseconds: 0 };
const address = { label: 'Home', addressLine: 'Synthetic address', area: 'Area', city: 'City', pincode: '560001', deliveryInstructions: '' };
const order = () => ({
  shopId: 'shop-a', customerUid: 'customer-a', currency: 'INR',
  items: [{ menuItemId: 'fixture-item', nameSnapshot: 'Synthetic dish', imageAssetKey: 'fixture.jpg', unitPricePaise: 13000, quantity: 2, lineTotalPaise: 26000, menuRevision: 1 }],
  subtotalPaise: 26000, discountPaise: 0, deliveryFeePaise: 0, totalPaise: 26000,
  status: 'placed', statusVersion: 1, payment: { status: 'unpaid' },
  fulfillment: 'pickup', addressSnapshot: null, createdAt: time, updatedAt: time,
});

test('only the agreed initial order statuses are accepted', () => {
  for (const status of ['placed', 'preparing', 'packed', 'food_ready']) assert.doesNotThrow(() => validateOrder({ ...order(), status }));
  for (const status of ['paid', 'accepted', 'ready', 'completed', 'cancelled', 'out_for_delivery', '', null]) assert.throws(() => validateOrderStatus(status));
});
test('order contracts require exactly unpaid and reject every payment method', () => {
  assert.doesNotThrow(() => validateOrder(order()));
  for (const payment of [{ status: 'paid' }, { status: 'unpaid', method: 'cash' }, { status: 'pending' }, {}, null]) assert.throws(() => validateOrder({ ...order(), payment }));
  assert.throws(() => validateOrder({ ...order(), paymentMethod: 'cash' }));
  assert.throws(() => orderEntity('fixture', { ...order(), payment: { status: 'paid' } }));
});
test('pickup and delivery have distinct address contracts', () => {
  assert.doesNotThrow(() => validateOrder({ ...order(), fulfillment: 'delivery', addressSnapshot: address }));
  assert.throws(() => validateOrder({ ...order(), fulfillment: 'delivery' }));
  assert.throws(() => validateOrder({ ...order(), addressSnapshot: address }));
  assert.throws(() => validateOrder({ ...order(), deliveryFeePaise: 1, totalPaise: 26001 }));
});
test('order validation rejects unsafe quantities, duplicate items and tampered totals', () => {
  for (const quantity of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER]) assert.throws(() => validateOrder({ ...order(), items: [{ ...order().items[0], quantity }] }));
  assert.throws(() => validateOrder({ ...order(), items: [order().items[0], order().items[0]] }));
  assert.throws(() => validateOrder({ ...order(), totalPaise: 1 }));
  assert.throws(() => validateOrder({ ...order(), items: [] }));
});
test('owner mutation contracts expose only positive integer price and boolean availability', () => {
  assert.deepEqual(validateOwnerMenuPatch({ pricePaise: 14000, available: false }), { pricePaise: 14000, available: false });
  for (const patch of [{}, { pricePaise: 0 }, { pricePaise: 1.5 }, { available: 'false' }, { name: 'Changed' }, { imageAssetKey: 'Changed' }, { description: 'Changed' }, { revision: 2 }]) assert.throws(() => validateOwnerMenuPatch(patch));
});
test('profile and address validation reject privilege fields and path injection', () => {
  assert.deepEqual(validateProfile({ displayName: 'Customer', defaultAddressId: null }), { displayName: 'Customer', defaultAddressId: null });
  assert.throws(() => validateProfile({ displayName: 'Customer', defaultAddressId: null, role: 'owner' }));
  for (const value of ['../other', 'users/other/addresses/x', '', 'x'.repeat(129)]) assert.throws(() => id(value));
  assert.throws(() => validateProfile({ displayName: 'Customer', defaultAddressId: 'users/other/addresses/x' }));
  assert.doesNotThrow(() => validateAddress(address));
  assert.throws(() => validateAddress({ ...address, addressLine: '   ' }));
  assert.throws(() => validateAddress({ ...address, pincode: '000000' }));
});
test('timestamp and menu mapping preserve exact IDs, prices and bundled keys', () => {
  const menu = { name: 'Synthetic dish', categoryId: 'pizza', pricePaise: 13000, imageAssetKey: 'assets/images/menu/pizza.jpg', currency: 'INR', description: '', availabilityNote: '', isVeg: true, available: true, published: true, sortOrder: 0, revision: 1, createdAt: time, updatedAt: time };
  const mapped = menuEntity('db-veg-pizza', menu);
  assert.equal(mapped.id, 'db-veg-pizza'); assert.equal(mapped.data.pricePaise, 13000); assert.equal(mapped.data.imageAssetKey, menu.imageAssetKey);
  assert.deepEqual(normalize({ timestamp: { seconds: 1, nanoseconds: 0, toDate() {} } }), { timestamp: time });
  assert.throws(() => menuEntity('fixture', { ...menu, pricePaise: 1.5 }));
});
test('the original 122-item source catalog remains byte-identical to the approved baseline', () => {
  const bytes = readFileSync(new URL('../../src/data/restaurantMenu.json', import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), 'a42fbe37b1fda0e70c649eba5b8de0bc855f0f656c84c578151ff09d2bc7c53a');
  const items = JSON.parse(bytes);
  assert.equal(items.length, 122); assert.equal(new Set(items.map(x => x.id)).size, 122);
});
test('Firestore document contracts reject malformed shop/category/profile/address/membership records', () => {
  assert.doesNotThrow(() => validateShop({ name: 'Synthetic shop', contactEmail: 'fixture@example.invalid', currency: 'INR', timezone: 'Asia/Kolkata', acceptsOrders: false, fulfillmentOptions: ['pickup', 'delivery'], menuVersion: 1, createdAt: time, updatedAt: time }));
  assert.throws(() => validateShop({ name: 'Missing configuration' }));
  assert.throws(() => validateCategory({ name: 'Fixture', isActive: 'true', sortOrder: 0, imageAssetKey: 'fixture.jpg', createdAt: time, updatedAt: time }));
  assert.throws(() => validateProfileDocument({ displayName: 'Customer', defaultAddressId: null, role: 'owner', createdAt: time, updatedAt: time }));
  assert.throws(() => validateAddressDocument({ ...address, createdAt: time, updatedAt: null }));
  assert.doesNotThrow(() => validateMembership({ role: 'owner', active: false, grantedBy: 'synthetic-admin', grantedAt: time }));
  assert.throws(() => validateMembership({ role: 'admin', active: true, grantedBy: 'synthetic-admin', grantedAt: time }));
});
