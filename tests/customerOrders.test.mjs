import test from 'node:test';
import assert from 'node:assert/strict';
import { createCustomerOrderApi } from '../src/services/customerOrders.ts';
import { createCustomerOrderSession } from '../src/services/customerOrderSession.ts';
import { canClearSubmittedCart, mergeReorderItems } from '../src/services/submittedCart.ts';
const tick = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const audit = { createdAt: { seconds: 1000, nanoseconds: 0 }, updatedAt: { seconds: 1000, nanoseconds: 0 } };
const line = { menuItemId: 'dish-a', nameSnapshot: 'Trusted dish', imageAssetKey: 'test.jpg', unitPricePaise: 13000, quantity: 2, lineTotalPaise: 26000, menuRevision: 2 };
const address = { label: 'Home', addressLine: 'Test street', area: 'Campus', city: 'Test city', pincode: '560001', deliveryInstructions: '' };
const draft = (fulfillment = 'pickup') => ({ key: fulfillment + '-version1', cart: { uid: 'customer-a', version: 1, instance: 'runtime-1' }, input: { shopId: 'demo-desi-bites', items: [{ menuItemId: 'dish-a', quantity: 2 }], couponCode: null,
  ...(fulfillment === 'pickup' ? { fulfillment, addressId: null } : { fulfillment, addressId: 'home' }) } });
function fixture() {
  let uid = 'customer-a', serial = 0, pending = null, timeoutOnce = false, failureCode = null, calls = [], cleared = 0;
  let currentCart = { uid, version: 1, instance: 'runtime-1' }, confirmGate = null, quoteGate = null, historyResult = [];
  const receipts = new Map();
  const quoteResult = input => ({ quoteId: 'quote-a', policyId: 'test-only-demo-v1', expiresAt: { seconds: 9999999999, nanoseconds: 0 }, items: [line], currency: 'INR', fulfillment: input.fulfillment,
    addressSnapshot: input.fulfillment === 'pickup' ? null : address, subtotalPaise: 26000, discountPaise: 0, deliveryFeePaise: input.fulfillment === 'pickup' ? 0 : 3500, totalPaise: input.fulfillment === 'pickup' ? 26000 : 29500 });
  let quoted;
  const repository = { kind: 'emulator', orders: { mine: async (_shop, page) => typeof historyResult === 'function' ? historyResult(page) : historyResult } };
  const api = createCustomerOrderApi('customer-a', () => uid, repository, async (name, input) => {
    calls.push({ name, input: structuredClone(input) });
    if (name === 'createCustomerQuote') { if (quoteGate) await quoteGate.promise; return quoted = quoteResult(input); }
    if (name === 'getCustomerOrder') return [...receipts.values()].find(item => item.id === input.orderId);
    if (confirmGate) await confirmGate.promise;
    if (failureCode) throw Object.assign(new Error('Rejected'), { code: failureCode });
    if (!receipts.has(input.submissionKey)) {
      const { quoteId, policyId, expiresAt, ...data } = quoted;
      receipts.set(input.submissionKey, { id: 'order-a', data: { ...data, customerUid: 'customer-a', shopId: 'demo-desi-bites', ...audit, status: 'placed', statusVersion: 1, payment: { status: 'unpaid' } } });
    }
    if (timeoutOnce) { timeoutOnce = false; throw Object.assign(new Error('Lost response'), { code: 'functions/deadline-exceeded' }); }
    return receipts.get(input.submissionKey);
  }, () => (++serial).toString(16).padStart(32, '0'));
  const storage = { get: async () => pending, set: async value => { pending = value; }, clear: async () => { pending = null; } };
  const create = () => createCustomerOrderSession('customer-a', () => uid, api, storage, (_order, submitted) => { if (canClearSubmittedCart(currentCart, submitted)) cleared++; });
  const session = create();
  return { session, api, receipts, calls, create,
    get pending() { return pending; }, get cleared() { return cleared; },
    switch: () => { uid = 'customer-b'; currentCart = { uid, version: 1 }; }, changeCart: () => { currentCart.version++; },
    timeout: () => { timeoutOnce = true; }, reject: code => { failureCode = code; },
    reloadCart: () => { currentCart = { uid, version: 1, instance: 'runtime-2' }; },
    delayConfirm: () => confirmGate = deferred(), delayQuote: () => quoteGate = deferred(),
    history: result => { historyResult = result; },
  };
}
test('pickup and delivery use actual typed API contracts and clear only after confirmed unpaid success', async () => {
  for (const fulfillment of ['pickup', 'delivery']) {
    const f = fixture(); await f.session.start(); await f.session.quote(draft(fulfillment));
    assert.equal(f.session.getSnapshot().phase, 'review'); assert.equal(f.cleared, 0);
    await f.session.confirm();
    assert.equal(f.session.getSnapshot().phase, 'success'); assert.equal(f.cleared, 1);
    assert.deepEqual(f.session.getSnapshot().success.data.payment, { status: 'unpaid' });
    assert.equal(f.session.getSnapshot().success.data.totalPaise, fulfillment === 'pickup' ? 26000 : 29500);
    assert.deepEqual(Object.keys(f.calls.find(c => c.name === 'confirmCustomerOrder').input).sort(), ['quoteId', 'submissionKey']);
    assert.equal(f.pending, null);
  }
});
test('timeout retries the identical persisted key and recovers one order without premature cart clearing', async () => {
  const f = fixture(); await f.session.start(); await f.session.quote(draft()); f.timeout(); await f.session.confirm();
  assert.equal(f.session.getSnapshot().phase, 'uncertain'); assert.equal(f.cleared, 0); assert.ok(f.pending);
  await f.session.quote({ ...draft(), key: 'different' });
  assert.equal(f.calls.filter(c => c.name === 'createCustomerQuote').length, 1);
  await f.session.confirm(); assert.equal(f.cleared, 1); assert.equal(f.receipts.size, 1);
  const inputs = f.calls.filter(c => c.name === 'confirmCustomerOrder').map(c => c.input);
  assert.deepEqual(inputs[0], inputs[1]);
});
test('pending confirmation survives controller disposal/reload and keeps its submission key', async () => {
  const f = fixture(); await f.session.start(); await f.session.quote(draft()); f.timeout(); await f.session.confirm();
  const key = f.session.getSnapshot().attempt.submissionKey; f.session.dispose();
  const restored = f.create(); await restored.start(); assert.equal(restored.getSnapshot().phase, 'uncertain');
  assert.equal(restored.getSnapshot().attempt.submissionKey, key); await restored.confirm(); assert.equal(f.receipts.size, 1);
});
test('duplicate confirm handlers cannot issue overlapping submissions', async () => {
  const f = fixture(); await f.session.start(); await f.session.quote(draft()); const gate = f.delayConfirm();
  const first = f.session.confirm(); await tick(); await f.session.confirm();
  assert.equal(f.calls.filter(c => c.name === 'confirmCustomerOrder').length, 1);
  gate.resolve(); await first; assert.equal(f.receipts.size, 1);
});
test('cart changes during confirmation preserve newer cart contents', async () => {
  const f = fixture(); await f.session.start(); await f.session.quote(draft()); const gate = f.delayConfirm();
  const work = f.session.confirm(); await tick(); f.changeCart(); gate.resolve(); await work;
  assert.equal(f.session.getSnapshot().phase, 'success'); assert.equal(f.cleared, 0);
});
test('account switch during confirmation cannot publish success or clear another cart', async () => {
  const f = fixture(); await f.session.start(); await f.session.quote(draft()); const gate = f.delayConfirm();
  const work = f.session.confirm(); await tick(); f.switch(); gate.resolve(); await work;
  assert.equal(f.cleared, 0); assert.equal(f.session.getSnapshot().success, null);
});
test('changing checkout during a quote request discards its late result', async () => {
  const f = fixture(); await f.session.start(); const gate = f.delayQuote();
  const work = f.session.quote(draft()); await tick(); f.session.updateDraft({ ...draft(), key: 'changed' }); gate.resolve(); await work;
  assert.equal(f.session.getSnapshot().attempt, null); assert.equal(f.session.getSnapshot().phase, 'idle');
});
test('changed reviewed checkout and definitive server rejection require a new quote', async () => {
  const f = fixture(); await f.session.start(); await f.session.quote(draft());
  f.session.updateDraft({ ...draft(), key: 'address-changed' }); await f.session.confirm();
  assert.equal(f.calls.filter(c => c.name === 'confirmCustomerOrder').length, 0);
  await f.session.quote(draft()); f.reject('functions/failed-precondition'); await f.session.confirm();
  assert.equal(f.session.getSnapshot().phase, 'error'); assert.equal(f.pending, null); assert.equal(f.cleared, 0);
});
test('out-of-order history responses cannot overwrite the latest refresh and pages deduplicate', async () => {
  const f = fixture(); await f.session.start(); await tick(); await f.session.quote(draft()); await f.session.confirm();
  const order = f.session.getSnapshot().success, first = deferred(), second = deferred(); let call = 0;
  f.history(() => (++call === 1 ? first.promise : second.promise));
  const a = f.session.history(), b = f.session.history(); second.resolve([order]); await b; first.resolve([]); await a;
  assert.deepEqual(f.session.getSnapshot().orders.map(o => o.id), ['order-a']);
  f.history(Array.from({ length: 20 }, (_, n) => ({ ...order, id: `order-${n}` }))); await f.session.history();
  f.history([order]); await f.session.history(true); assert.equal(new Set(f.session.getSnapshot().orders.map(o => o.id)).size, 21);
});
test('order details use ownership validation and support unavailable results', async () => {
  const f = fixture(); await f.session.start(); await f.session.quote(draft()); await f.session.confirm();
  await f.session.loadOrder('order-a'); assert.equal(f.session.getSnapshot().detail.id, 'order-a');
  await f.session.loadOrder('missing'); assert.equal(f.session.getSnapshot().detail, null); assert.match(f.session.getSnapshot().detailError, /unavailable/);
  const foreign = structuredClone(f.session.getSnapshot().success); foreign.data.customerUid = 'foreign'; f.history([foreign]);
  await f.session.history(); assert.match(f.session.getSnapshot().error, /could not be loaded/);
});
test('empty history and disposal leave no fabricated orders or late results', async () => {
  const f = fixture(); await f.session.start(); await tick(); assert.deepEqual(f.session.getSnapshot().orders, []);
  const wait = deferred(); f.history(() => wait.promise); const work = f.session.history(); f.session.dispose(); wait.resolve([]); await work;
  assert.equal(f.cleared, 0);
});
test('reorder refreshes matching old cart prices and preserves unrelated lines', () => {
  const old = { id: 'dish-a', name: 'Old dish', price: 100, image: 'old.jpg' };
  const current = { ...old, name: 'Current dish', price: 130, image: 'current.jpg' };
  const other = { ...old, id: 'other' };
  const result = mergeReorderItems([{ product: old, quantity: 1 }, { product: other, quantity: 1 }], [{ product: current, quantity: 2 }]);
  assert.equal(result[0].product.price, 130); assert.equal(result[0].quantity, 3); assert.equal(result[1].product, other);
  assert.equal(canClearSubmittedCart({ uid: 'a', version: 2 }, { uid: 'a', version: 1 }), false);
  assert.equal(canClearSubmittedCart({ uid: 'b', version: 1 }, { uid: 'a', version: 1 }), false);
});
test('a restored attempt cannot clear a new cart with a coincidentally equal revision', async () => {
  const f = fixture(); await f.session.start(); await f.session.quote(draft()); f.timeout(); await f.session.confirm();
  f.session.dispose(); f.reloadCart(); const restored = f.create(); await restored.start(); await restored.confirm();
  assert.equal(restored.getSnapshot().phase, 'success'); assert.equal(f.cleared, 0);
});
test('a history request started before confirmation cannot erase the newly confirmed order', async () => {
  const f = fixture(), wait = deferred(); f.history(() => wait.promise);
  await f.session.start(); await f.session.quote(draft()); await f.session.confirm(); wait.resolve([]); await tick();
  assert.equal(f.session.getSnapshot().orders[0].id, 'order-a');
});
