import test from 'node:test';
import assert from 'node:assert/strict';
import { deleteApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { createQuoteHandler } from '../src/quoteService.ts';
import { adminQuoteStore, getEmulatorQuoteStore } from '../src/adminQuoteStore.ts';
import { createCustomerQuote } from '../src/index.ts';
import { EMULATOR_PROJECT, requireQuoteEmulators } from '../src/emulatorOnly.ts';

const now = { seconds: 1000, nanoseconds: 0 };
const audit = { createdAt: now, updatedAt: now };
const input = () => ({ shopId: 'shop-a', items: [{ menuItemId: 'dish-a', quantity: 2 }], fulfillment: 'pickup' });
function fixture() {
  return new Map([
    ['shops/shop-a', { name: 'Synthetic shop', contactEmail: 'test@example.invalid', currency: 'INR', timezone: 'Asia/Kolkata', acceptsOrders: true, fulfillmentOptions: ['pickup', 'delivery'], menuVersion: 1, ...audit }],
    ['shops/shop-a/menuItems/dish-a', { name: 'Synthetic dish', categoryId: 'category-a', pricePaise: 13250, currency: 'INR', imageAssetKey: 'test.jpg', description: '', availabilityNote: '', isVeg: true, available: true, published: true, sortOrder: 0, revision: 3, ...audit }],
    ['shops/shop-a/menuCategories/category-a', { name: 'Synthetic category', sortOrder: 0, isActive: true, imageAssetKey: 'test.jpg', ...audit }],
    ['users/customer-a/addresses/home', { label: 'Home', addressLine: 'Synthetic street', area: 'Test area', city: 'Test city', pincode: '560001', deliveryInstructions: '', ...audit }],
    ['users/customer-b/addresses/foreign', { label: 'Work', addressLine: 'Foreign street', area: 'Test area', city: 'Test city', pincode: '560001', deliveryInstructions: '', ...audit }],
  ]);
}
// Exercises the real service AND Admin adapter with an in-memory SDK substitute.
// These tests prove paths/serialization, not Firestore rules, transactions or JWTs.
function harness() {
  const documents = fixture(), reads = [], writes = [];
  let fail = false;
  const db = {
    doc: path => ({ path }),
    collection: path => ({ doc: (value = 'generated-quote') => ({ path: `${path}/${value}`, id: value }) }),
    async runTransaction(run) {
      const staged = [];
      const result = await run({
        async get(ref) { reads.push(ref.path); return { exists: documents.has(ref.path), data: () => structuredClone(documents.get(ref.path)) }; },
        create(ref, data) { staged.push([ref.path, data]); },
      });
      if (fail) throw new Error('Simulated backend unavailable');
      writes.push(...staged);
      return result;
    },
  };
  return { documents, reads, writes, fail: () => { fail = true; }, handler: createQuoteHandler(adminQuoteStore(db), () => now) };
}
const request = data => ({ auth: { uid: 'customer-a' }, data });
const code = expected => error => error.code === expected;

test('unauthenticated service requests are rejected before database access', async () => {
  const h = harness(); await assert.rejects(h.handler({ data: input() }), code('unauthenticated'));
  assert.deepEqual(h.reads, []); assert.deepEqual(h.writes, []);
});
test('forged identity, amounts, payment and status fields never reach storage', async () => {
  const h = harness();
  for (const key of ['uid', 'customerUid', 'price', 'totalPaise', 'subtotalPaise', 'payment', 'status']) await assert.rejects(h.handler(request({ ...input(), [key]: 'forged' })), code('invalid-argument'));
  await assert.rejects(h.handler(request({ ...input(), items: [{ ...input().items[0], pricePaise: 1 }] })), code('invalid-argument'));
  assert.deepEqual(h.reads, []); assert.deepEqual(h.writes, []);
});
test('pickup writes only a server-owned quote and returns a limited review DTO', async () => {
  const h = harness(); const review = await h.handler(request({ ...input(), couponCode: 'SPICE20' }));
  assert.deepEqual(h.reads, ['shops/shop-a', 'shops/shop-a/menuItems/dish-a', 'shops/shop-a/menuCategories/category-a']);
  assert.equal(h.writes.length, 1); const [path, stored] = h.writes[0];
  assert.equal(path, 'customerQuotes/generated-quote'); assert.equal(stored.customerUid, 'customer-a');
  assert.equal(stored.order.items[0].menuRevision, 3); assert.equal(stored.order.items[0].unitPricePaise, 13250);
  assert.equal(stored.createdAt instanceof Timestamp, true); assert.equal(stored.expiresAt.seconds, 1300);
  assert.deepEqual(stored.order.payment, { status: 'unpaid' });
  assert.equal(review.policyId, 'test-only-demo-v1'); assert.equal(review.totalPaise, 21200);
  assert.equal(review.deliveryFeePaise, 0); assert.equal(review.addressSnapshot, null);
  assert.deepEqual(Object.keys(review).sort(), ['quoteId', 'policyId', 'expiresAt', 'items', 'currency', 'fulfillment', 'addressSnapshot', 'subtotalPaise', 'discountPaise', 'deliveryFeePaise', 'totalPaise'].sort());
});
test('delivery reads only the authenticated owner address and snapshots it', async () => {
  const h = harness(); const review = await h.handler(request({ ...input(), fulfillment: 'delivery', addressId: 'home' }));
  assert.equal(h.reads.at(-1), 'users/customer-a/addresses/home'); assert.equal(review.addressSnapshot.addressLine, 'Synthetic street');
  assert.equal(review.deliveryFeePaise, 3500); assert.equal(review.totalPaise, 30000);
});
test('missing and foreign addresses fail identically without reading foreign paths', async () => {
  for (const addressId of ['missing', 'foreign']) {
    const h = harness(); await assert.rejects(h.handler(request({ ...input(), fulfillment: 'delivery', addressId })), code('failed-precondition'));
    assert.equal(h.reads.at(-1), `users/customer-a/addresses/${addressId}`);
    assert.equal(h.reads.some(path => path.startsWith('users/customer-b')), false); assert.equal(h.writes.length, 0);
  }
});
test('delivery without a reference and invalid quantities/duplicates fail before reads', async () => {
  for (const data of [{ ...input(), fulfillment: 'delivery' }, ...[0, -1, 1.5, NaN, '2'].map(quantity => ({ ...input(), items: [{ menuItemId: 'dish-a', quantity }] })), { ...input(), items: [...input().items, ...input().items] }]) {
    const h = harness(); await assert.rejects(h.handler(request(data)), code('invalid-argument')); assert.equal(h.reads.length, 0);
  }
});
test('missing, unavailable, unpublished and incorrectly categorized menu items cannot issue quotes', async () => {
  for (const change of [h => h.documents.delete('shops/shop-a/menuItems/dish-a'), h => { h.documents.get('shops/shop-a/menuItems/dish-a').available = false; }, h => { h.documents.get('shops/shop-a/menuItems/dish-a').published = false; }, h => { h.documents.get('shops/shop-a/menuItems/dish-a').categoryId = 'missing'; }, h => { h.documents.get('shops/shop-a/menuCategories/category-a').isActive = false; }]) {
    const h = harness(); change(h); await assert.rejects(h.handler(request(input())), code('failed-precondition')); assert.equal(h.writes.length, 0);
  }
});
test('closed shops, unsupported fulfillment and invalid address documents cannot issue quotes', async () => {
  for (const change of [h => { h.documents.get('shops/shop-a').acceptsOrders = false; }, h => { h.documents.get('shops/shop-a').fulfillmentOptions = ['pickup']; }, h => { h.documents.get('users/customer-a/addresses/home').pincode = '000000'; }]) {
    const h = harness(); change(h); await assert.rejects(h.handler(request({ ...input(), fulfillment: 'delivery', addressId: 'home' })), code('failed-precondition')); assert.equal(h.writes.length, 0);
  }
});
test('backend persistence failures surface as retryable errors without returning a quote', async () => {
  const h = harness(); h.fail(); await assert.rejects(h.handler(request(input())), code('unavailable')); assert.equal(h.writes.length, 0);
});
test('each quote is bound to callable identity rather than a request UID', async () => {
  const h = harness(); await h.handler({ auth: { uid: 'customer-b' }, data: input() });
  assert.equal(h.writes[0][1].customerUid, 'customer-b'); assert.equal(h.writes[0][1].order.customerUid, 'customer-b');
});
test('emulator guard requires every exact project and endpoint, including Functions mode', () => {
  const env = { FUNCTIONS_EMULATOR: 'true', GCLOUD_PROJECT: EMULATOR_PROJECT, FIREBASE_CONFIG: JSON.stringify({ projectId: EMULATOR_PROJECT }), FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080', FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099' };
  assert.doesNotThrow(() => requireQuoteEmulators(env));
  for (const key of Object.keys(env)) { const bad = { ...env }; delete bad[key]; assert.throws(() => requireQuoteEmulators(bad)); }
  for (const override of [{ GCLOUD_PROJECT: 'production-project' }, { FIRESTORE_EMULATOR_HOST: 'example.com:8080' }, { FIREBASE_CONFIG: '{}' }, { FIREBASE_CONFIG: 'broken' }]) assert.throws(() => requireQuoteEmulators({ ...env, ...override }));
});
test('actual callable wrapper rejects unauthenticated and non-emulator direct invocations without Admin initialization', async () => {
  // .run bypasses HTTP token verification: this is a guard test, not a JWT test.
  const before = getApps().length;
  await assert.rejects(createCustomerQuote.run({ data: input() }), code('unauthenticated'));
  const previous = process.env.FUNCTIONS_EMULATOR;
  delete process.env.FUNCTIONS_EMULATOR;
  try { await assert.rejects(createCustomerQuote.run(request(input())), code('failed-precondition')); }
  finally { if (previous !== undefined) process.env.FUNCTIONS_EMULATOR = previous; }
  assert.equal(getApps().length, before);
});

test('real Admin Firestore initializes under emulator guards without a custom credential or network request', async () => {
  const local = { FUNCTIONS_EMULATOR: 'true', GCLOUD_PROJECT: EMULATOR_PROJECT,
    FIREBASE_CONFIG: JSON.stringify({ projectId: EMULATOR_PROJECT }),
    FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080', FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099' };
  const previous = Object.fromEntries(Object.keys(local).map(key => [key, process.env[key]]));
  Object.assign(process.env, local);
  let app;
  try {
    // Previously this call threw invalid-credential inside getFirestore(app).
    const store = getEmulatorQuoteStore();
    app = getApps().find(app => app.name === 'stage4-quotes-emulator-only');
    assert.ok(app);
    assert.equal(getFirestore(app).projectId, EMULATOR_PROJECT);
    assert.equal(getEmulatorQuoteStore(), store);
    delete process.env.FIRESTORE_EMULATOR_HOST;
    assert.throws(() => getEmulatorQuoteStore(), /isolated local emulator suite/);
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    if (app) { await getFirestore(app).terminate(); await deleteApp(app); }
  }
});
