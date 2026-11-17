import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDemoQuote } from '../src/domain/quote.ts';
import { createConfirmationHandler, createOrderLookupHandler, submissionReceiptId } from '../src/orderService.ts';
import { confirmCustomerOrder, getCustomerOrder } from '../src/index.ts';

const now = { seconds: 1000, nanoseconds: 0 }, audit = { createdAt: now, updatedAt: now };
const uid = 'customer-a';
const input = () => ({ quoteId: 'quote-a', submissionKey: 'a'.repeat(32) });
function harness() {
  const context = {
    customerUid: uid,
    shop: { id: 'shop-a', data: { name: 'Test shop', contactEmail: 'test@example.invalid', currency: 'INR', timezone: 'Asia/Kolkata', acceptsOrders: true, fulfillmentOptions: ['pickup'], menuVersion: 1, ...audit } },
    categories: [{ id: 'category-a', data: { name: 'Test category', sortOrder: 0, isActive: true, imageAssetKey: 'test.jpg', ...audit } }],
    menuItems: [{ id: 'dish-a', data: { name: 'Test dish', categoryId: 'category-a', pricePaise: 13000, currency: 'INR', imageAssetKey: 'test.jpg', description: '', availabilityNote: '', isVeg: true, available: true, published: true, sortOrder: 0, revision: 1, ...audit } }],
  };
  const quote = buildDemoQuote({ shopId: 'shop-a', fulfillment: 'pickup', items: [{ menuItemId: 'dish-a', quantity: 2 }] }, context, now, 'quote-a');
  const documents = new Map([
    ['customerQuotes/quote-a', { ...quote, customerUid: uid, shopId: 'shop-a' }],
    ['shops/shop-a', context.shop.data], ['shops/shop-a/menuItems/dish-a', context.menuItems[0].data], ['shops/shop-a/menuCategories/category-a', context.categories[0].data],
  ]);
  const reads = []; let fail = false;
  const store = {
    newOrderId: () => 'order-a',
    getOrder: async id => structuredClone(documents.get(`orders/${id}`) ?? null),
    async transaction(run) {
      const staged = new Map(documents);
      const result = await run({
        get: async path => { reads.push(path); return structuredClone(staged.get(path) ?? null); },
        createOrder: (id, data) => staged.set(`orders/${id}`, data),
        createHistory: (id, data) => staged.set(`orders/${id}/statusHistory/initial`, data),
        consumeQuote: (id, orderId) => staged.set(`customerQuotes/${id}`, { ...staged.get(`customerQuotes/${id}`), consumedOrderId: orderId }),
        createReceipt: (id, data) => staged.set(`orderSubmissions/${id}`, data),
      });
      if (fail) throw new Error('Injected failure');
      for (const [path, value] of staged) documents.set(path, structuredClone(value));
      return result;
    },
  };
  return { documents, reads, fail: () => { fail = true; }, store, run: createConfirmationHandler(store, () => now) };
}
const request = data => ({ auth: { uid }, data });
const code = expected => error => error.code === expected;

test('confirmation rejects missing auth and forged/oversized input before any reads', async () => {
  const h = harness(); await assert.rejects(h.run({ data: input() }), code('unauthenticated'));
  for (const data of [{ ...input(), customerUid: 'foreign' }, { ...input(), payment: { status: 'paid' } }, { ...input(), submissionKey: 'x'.repeat(129) }, { ...input(), submissionKey: 'short' }]) await assert.rejects(h.run(request(data)), code('invalid-argument'));
  assert.deepEqual(h.reads, []);
});
test('confirmation service stages all four canonical changes with placed/unpaid values', async () => {
  const h = harness(); const result = await h.run(request(input()));
  assert.equal(result.id, 'order-a'); assert.deepEqual(result.data.payment, { status: 'unpaid' }); assert.equal(result.data.status, 'placed');
  assert.equal(h.documents.get('customerQuotes/quote-a').consumedOrderId, 'order-a');
  assert.equal(h.documents.get('orders/order-a/statusHistory/initial').fromStatus, null);
  assert.equal(h.documents.get(`orderSubmissions/${submissionReceiptId(uid, input().submissionKey)}`).orderId, result.id);
});
test('successful receipt is checked before quote and current menu, recovering a lost response', async () => {
  const h = harness(); const first = await h.run(request(input()));
  h.documents.delete('customerQuotes/quote-a'); h.documents.delete('shops/shop-a'); h.reads.length = 0;
  assert.deepEqual(await h.run(request(input())), first);
  assert.equal(h.reads.length, 2); assert.equal(h.reads[1], 'orders/order-a');
  await assert.rejects(h.run(request({ ...input(), quoteId: 'other' })), code('already-exists'));
});
test('expired, consumed, foreign and malformed quotes cannot stage an order', async () => {
  for (const change of [q => { q.expiresAt = { seconds: 999, nanoseconds: 0 }; }, q => { q.consumedOrderId = 'existing'; }, q => { q.customerUid = 'foreign'; }, q => { q.order.totalPaise = 1; }]) {
    const h = harness(); change(h.documents.get('customerQuotes/quote-a'));
    await assert.rejects(h.run(request(input()))); assert.equal(h.documents.has('orders/order-a'), false);
  }
});
test('current price, revision and category changes cannot silently reprice an order', async () => {
  for (const change of [h => { h.documents.get('shops/shop-a/menuItems/dish-a').pricePaise = 14000; }, h => { h.documents.get('shops/shop-a/menuItems/dish-a').revision = 2; }, h => { h.documents.get('shops/shop-a/menuCategories/category-a').isActive = false; }]) {
    const h = harness(); change(h); await assert.rejects(h.run(request(input())), code('failed-precondition')); assert.equal(h.documents.has('orders/order-a'), false);
  }
});
test('failed transaction retains an unused quote and no order/history/receipt', async () => {
  const h = harness(); h.fail(); await assert.rejects(h.run(request(input())), code('unavailable'));
  assert.equal(h.documents.get('customerQuotes/quote-a').consumedOrderId, null);
  assert.equal([...h.documents.keys()].some(path => path.startsWith('orders/') || path.startsWith('orderSubmissions/')), false);
});
test('order lookup is authenticated, exact-input and owner-only', async () => {
  const h = harness(); await h.run(request(input())); const lookup = createOrderLookupHandler(h.store);
  assert.equal((await lookup(request({ orderId: 'order-a' }))).id, 'order-a');
  await assert.rejects(lookup({ data: { orderId: 'order-a' } }), code('unauthenticated'));
  await assert.rejects(lookup({ auth: { uid: 'foreign' }, data: { orderId: 'order-a' } }), code('not-found'));
  await assert.rejects(lookup(request({ orderId: 'order-a', uid })), code('invalid-argument'));
});
test('submission receipt hashes isolate UID and have no delimiter collision', () => {
  assert.notEqual(submissionReceiptId('a', 'bc'), submissionReceiptId('ab', 'c'));
  assert.notEqual(submissionReceiptId(uid, input().submissionKey), submissionReceiptId('other', input().submissionKey));
});
test('real confirmation and lookup wrappers fail closed outside emulators', async () => {
  const previous = process.env.FUNCTIONS_EMULATOR; delete process.env.FUNCTIONS_EMULATOR;
  try {
    for (const endpoint of [confirmCustomerOrder, getCustomerOrder]) {
      await assert.rejects(endpoint.run({ data: {} }), code('unauthenticated'));
      await assert.rejects(endpoint.run(request({})), code('failed-precondition'));
    }
  } finally { if (previous !== undefined) process.env.FUNCTIONS_EMULATOR = previous; }
});
