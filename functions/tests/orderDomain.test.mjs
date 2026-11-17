import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSubmission, validateConfirmation } from '../src/domain/submission.ts';
import { calculateDemoTotals, safePaise, TEST_ONLY_DEMO_POLICY_V1 as policy } from '../src/domain/demoPricing.ts';
import { buildDemoQuote, initialOrderFromQuote, DEMO_QUOTE_TTL_SECONDS } from '../src/domain/quote.ts';
import { validateOrder } from '../../src/backend/validation.ts';
import { calculateCartEstimate } from '../../src/services/cart.ts';

const now = { seconds: 1000, nanoseconds: 123 };
const audit = { createdAt: now, updatedAt: now };
const request = () => ({ shopId: 'shop-a', fulfillment: 'pickup', items: [{ menuItemId: 'dish-a', quantity: 2 }] });
function context() {
  return {
    customerUid: 'customer-a',
    shop: { id: 'shop-a', data: { name: 'Synthetic test shop', contactEmail: 'test@example.invalid', currency: 'INR', timezone: 'Asia/Kolkata', acceptsOrders: true, fulfillmentOptions: ['pickup', 'delivery'], menuVersion: 1, ...audit } },
    categories: [{ id: 'category-a', data: { name: 'Synthetic category', sortOrder: 0, isActive: true, imageAssetKey: 'test.jpg', ...audit } }],
    menuItems: [{ id: 'dish-a', data: { name: 'Synthetic dish', categoryId: 'category-a', pricePaise: 13000, currency: 'INR', imageAssetKey: 'test.jpg', description: '', availabilityNote: '', isVeg: true, available: true, published: true, sortOrder: 0, revision: 7, ...audit } }],
    savedAddress: { customerUid: 'customer-a', address: { id: 'address-a', data: { label: 'Home', addressLine: 'Synthetic street', area: 'Test area', city: 'Test city', pincode: '560001', deliveryInstructions: '', ...audit } } },
  };
}
const quote = () => buildDemoQuote(request(), context(), now, 'quote-a');

test('submission accepts positive integer quantities and copies client input', () => {
  for (const quantity of [1, 2, 99]) {
    const raw = request(); raw.items[0].quantity = quantity;
    const parsed = validateSubmission(raw);
    assert.equal(parsed.items[0].quantity, quantity);
    raw.items[0].quantity = 0;
    assert.equal(parsed.items[0].quantity, quantity);
  }
});
test('submission rejects invalid quantities rather than coercing them', () => {
  for (const quantity of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '2', null, true]) {
    const raw = request(); raw.items[0].quantity = quantity;
    assert.throws(() => validateSubmission(raw));
  }
});
test('submission rejects duplicate and invalid item IDs', () => {
  assert.throws(() => validateSubmission({ ...request(), items: [...request().items, ...request().items] }), /Duplicate/);
  for (const menuItemId of ['', '../dish', 'shops/a', 'x'.repeat(129), null]) {
    assert.throws(() => validateSubmission({ ...request(), items: [{ menuItemId, quantity: 1 }] }));
  }
});
test('submission requires a nonempty bounded item array and valid shop', () => {
  for (const items of [[], null, Array.from({ length: 101 }, (_, n) => ({ menuItemId: `dish-${n}`, quantity: 1 }))]) assert.throws(() => validateSubmission({ ...request(), items }));
  assert.throws(() => validateSubmission({ ...request(), shopId: '../shop' }));
});
test('client identity, amounts, statuses and extra line fields are rejected', () => {
  for (const key of ['customerUid', 'uid', 'price', 'subtotalPaise', 'totalPaise', 'payment', 'status', 'addressSnapshot']) assert.throws(() => validateSubmission({ ...request(), [key]: 'forged' }));
  assert.throws(() => validateSubmission({ ...request(), items: [{ ...request().items[0], unitPricePaise: 1 }] }));
});
test('pickup needs no address and rejects a supplied address reference', () => {
  assert.equal(validateSubmission(request()).addressId, null);
  assert.throws(() => validateSubmission({ ...request(), addressId: 'address-a' }));
  const q = quote(); assert.equal(q.order.addressSnapshot, null); assert.equal(q.order.deliveryFeePaise, 0);
});
test('delivery requires a valid saved-address ID, never an inline address', () => {
  for (const addressId of [undefined, null, '', '../foreign']) assert.throws(() => validateSubmission({ ...request(), fulfillment: 'delivery', addressId }));
  assert.throws(() => validateSubmission({ ...request(), fulfillment: 'delivery', addressId: 'address-a', address: context().savedAddress.address.data }));
  assert.throws(() => validateSubmission({ ...request(), fulfillment: 'courier' }));
});
test('demo delivery snapshots an owned saved address and trusted menu fields', () => {
  const c = context();
  const q = buildDemoQuote({ ...request(), fulfillment: 'delivery', addressId: 'address-a' }, c, now, 'quote-a');
  assert.equal(q.order.customerUid, 'customer-a'); assert.equal(q.submission.addressId, 'address-a');
  assert.equal(q.order.addressSnapshot.addressLine, 'Synthetic street');
  assert.equal(Object.hasOwn(q.order.addressSnapshot, 'createdAt'), false);
  assert.deepEqual(q.order.items[0], { menuItemId: 'dish-a', nameSnapshot: 'Synthetic dish', imageAssetKey: 'test.jpg', unitPricePaise: 13000, quantity: 2, lineTotalPaise: 26000, menuRevision: 7 });
  c.savedAddress.address.data.addressLine = 'Changed'; c.menuItems[0].data.name = 'Changed';
  assert.equal(q.order.addressSnapshot.addressLine, 'Synthetic street'); assert.equal(q.order.items[0].nameSnapshot, 'Synthetic dish');
  assert.equal(q.order.totalPaise, 29500);
});
test('missing, mismatched, foreign or invalid saved addresses are rejected', () => {
  const delivery = { ...request(), fulfillment: 'delivery', addressId: 'address-a' };
  for (const change of [c => { delete c.savedAddress; }, c => { c.savedAddress.customerUid = 'customer-b'; }, c => { c.savedAddress.address.id = 'other'; }, c => { c.savedAddress.address.data.pincode = '000000'; }]) {
    const c = context(); change(c); assert.throws(() => buildDemoQuote(delivery, c, now, 'quote-a'));
  }
});
test('deleted, unpublished, unavailable or inactive-category items cannot be quoted', () => {
  for (const change of [c => { c.menuItems = []; }, c => { c.menuItems[0].data.published = false; }, c => { c.menuItems[0].data.available = false; }, c => { c.categories[0].data.isActive = false; }, c => { c.categories = []; }]) {
    const c = context(); change(c); assert.throws(() => buildDemoQuote(request(), c, now, 'quote-a'), /unavailable/);
  }
});
test('closed, mismatched and unsupported-fulfillment shops are rejected', () => {
  for (const change of [c => { c.shop.data.acceptsOrders = false; }, c => { c.shop.id = 'other'; }, c => { c.shop.data.fulfillmentOptions = ['delivery']; }]) {
    const c = context(); change(c); assert.throws(() => buildDemoQuote(request(), c, now, 'quote-a'));
  }
});
test('quote enforces explicitly provisional demo quantity limits', () => {
  assert.equal(policy.maxQuantityPerItem, 99);
  assert.throws(() => buildDemoQuote({ ...request(), items: [{ menuItemId: 'dish-a', quantity: 100 }] }, context(), now, 'quote-a'), /limit/);
  const c = context(); c.menuItems = Array.from({ length: 6 }, (_, n) => ({ ...context().menuItems[0], id: `dish-${n}` }));
  assert.throws(() => buildDemoQuote({ ...request(), items: c.menuItems.map(item => ({ menuItemId: item.id, quantity: 99 })) }, c, now, 'quote-a'), /limit/);
});
test('integer-paise line arithmetic preserves fractional rupees and rejects overflow', () => {
  const c = context(); c.menuItems[0].data.pricePaise = 10001;
  assert.equal(buildDemoQuote(request(), c, now, 'quote-a').order.subtotalPaise, 20002);
  c.menuItems[0].data.pricePaise = Number.MAX_SAFE_INTEGER;
  assert.throws(() => buildDemoQuote(request(), c, now, 'quote-a'), /safe integer/);
  assert.equal(calculateDemoTotals(Number.MAX_SAFE_INTEGER, 'delivery', null).totalPaise, Number.MAX_SAFE_INTEGER);
  assert.throws(() => safePaise(BigInt(Number.MAX_SAFE_INTEGER) + 1n), /safe integer/);
  assert.throws(() => calculateDemoTotals(1.5, 'pickup', null));
});
test('test-only delivery policy preserves the inclusive 499-rupee threshold', () => {
  assert.equal(calculateDemoTotals(49899, 'delivery', null).deliveryFeePaise, 3500);
  assert.equal(calculateDemoTotals(49900, 'delivery', null).deliveryFeePaise, 0);
  assert.equal(calculateDemoTotals(49901, 'delivery', null).deliveryFeePaise, 0);
  assert.equal(calculateDemoTotals(13000, 'pickup', null).deliveryFeePaise, 0);
  assert.equal(calculateDemoTotals(0, 'delivery', null).deliveryFeePaise, 0);
});
test('test-only coupons preserve whole-rupee rounding and free delivery', () => {
  assert.deepEqual(calculateDemoTotals(13250, 'delivery', 'SPICE20'), { subtotalPaise: 13250, discountPaise: 2700, deliveryFeePaise: 3500, totalPaise: 14050 });
  assert.equal(calculateDemoTotals(13249, 'pickup', 'SPICE20').discountPaise, 2600);
  assert.equal(calculateDemoTotals(13000, 'pickup', 'FESTIVE40').discountPaise, 5200);
  assert.equal(calculateDemoTotals(13000, 'delivery', 'DESIEXPRESS').deliveryFeePaise, 0);
  assert.throws(() => calculateDemoTotals(13000, 'pickup', 'UNAPPROVED'));
  assert.throws(() => calculateDemoTotals(1, 'courier', null));
});
test('demo policy agrees with the actual existing cart estimate at representative boundaries', () => {
  for (const pricePaise of [100, 13249, 13250, 49899, 49900, 49901]) for (const fulfillment of ['pickup', 'delivery']) for (const coupon of [null, 'SPICE20', 'FESTIVE40', 'DESIEXPRESS']) {
    const { count, ...expected } = calculateCartEstimate([{ product: { id: 'test', price: pricePaise / 100 }, quantity: 1 }], coupon, fulfillment);
    assert.deepEqual(calculateDemoTotals(pricePaise, fulfillment, coupon), expected);
  }
});
test('coupon parsing normalizes strings without accepting malformed values', () => {
  assert.equal(validateSubmission({ ...request(), couponCode: ' spice20 ' }).couponCode, 'SPICE20');
  for (const couponCode of [false, {}, 'x'.repeat(41)]) assert.throws(() => validateSubmission({ ...request(), couponCode }));
});
test('fresh quotes produce only placed, version-one, unpaid Stage 1 orders', () => {
  const q = quote(); const confirmedAt = { seconds: 1001, nanoseconds: 0 };
  const order = initialOrderFromQuote(q, 'customer-a', confirmedAt);
  assert.equal(order.status, 'placed'); assert.equal(order.statusVersion, 1);
  assert.deepEqual(order.payment, { status: 'unpaid' }); assert.deepEqual(order.createdAt, confirmedAt);
  assert.equal(Object.hasOwn(order, 'paymentMethod'), false); assert.doesNotThrow(() => validateOrder(order));
  order.items[0].nameSnapshot = 'Changed'; assert.equal(q.order.items[0].nameSnapshot, 'Synthetic dish');
  assert.equal(q.consumedOrderId, null); // Pure conversion does not pretend to commit/consume.
});
test('quote expiry checks the exact timestamp boundary', () => {
  const q = quote(); assert.equal(q.expiresAt.seconds, now.seconds + DEMO_QUOTE_TTL_SECONDS);
  assert.doesNotThrow(() => initialOrderFromQuote(q, 'customer-a', { seconds: q.expiresAt.seconds, nanoseconds: q.expiresAt.nanoseconds - 1 }));
  assert.throws(() => initialOrderFromQuote(q, 'customer-a', q.expiresAt), /expired/);
  assert.throws(() => initialOrderFromQuote(q, 'customer-a', { seconds: q.expiresAt.seconds + 1, nanoseconds: 0 }), /expired/);
  assert.throws(() => initialOrderFromQuote(q, 'customer-a', { seconds: now.seconds - 1, nanoseconds: 0 }), /timing/);
});
test('another customer, consumed quotes and mismatched policy are rejected', () => {
  assert.throws(() => initialOrderFromQuote(quote(), 'customer-b', now), /another customer/);
  assert.throws(() => initialOrderFromQuote({ ...quote(), consumedOrderId: 'order-a' }, 'customer-a', now), /already used/);
  assert.throws(() => initialOrderFromQuote({ ...quote(), policyId: 'production' }, 'customer-a', now), /policy/);
});
test('initial order conversion rejects a quote carrying a paid state or inconsistent totals', () => {
  const paid = quote(); paid.order.payment = { status: 'paid' };
  assert.throws(() => initialOrderFromQuote(paid, 'customer-a', now), /unpaid/);
  const tampered = quote(); tampered.order.totalPaise = 1;
  assert.throws(() => initialOrderFromQuote(tampered, 'customer-a', now), /totals/);
});
test('quote rejects invalid timestamps, malformed trusted documents and duplicate trusted IDs', () => {
  assert.throws(() => buildDemoQuote(request(), context(), { seconds: -1, nanoseconds: 0 }, 'quote-a'));
  for (const change of [c => { c.menuItems[0].data.pricePaise = 1.5; }, c => { c.menuItems.push(c.menuItems[0]); }, c => { c.categories.push(c.categories[0]); }]) {
    const c = context(); change(c); assert.throws(() => buildDemoQuote(request(), c, now, 'quote-a'));
  }
  assert.throws(() => initialOrderFromQuote({ ...quote(), expiresAt: now }, 'customer-a', now), /timing/);
});
test('confirmation accepts only quote ID and a stable submission key', () => {
  const input = { quoteId: 'quote-a', submissionKey: 'a'.repeat(32) };
  assert.deepEqual(validateConfirmation(input), input);
  for (const extra of [{ customerUid: 'other' }, { totalPaise: 1 }, { status: 'placed' }, { payment: { status: 'paid' } }]) assert.throws(() => validateConfirmation({ ...input, ...extra }));
  assert.throws(() => validateConfirmation({ ...input, submissionKey: 'short' }));
  assert.throws(() => validateConfirmation({ ...input, quoteId: '../quote' }));
});
