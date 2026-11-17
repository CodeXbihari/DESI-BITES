import { before, after, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { signOut } from 'firebase/auth';
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { initializeApp as initializeAdmin, deleteApp as deleteAdmin } from 'firebase-admin/app';
import { getFirestore as adminFirestore } from 'firebase-admin/firestore';
import { environment, projectId, requireLocalEmulators, webClient } from '../../../tests/emulator/helpers.mjs';
import { fixtureDocuments, address } from '../../../tests/emulator/fixtures.mjs';
import { validateHistory, validateOrder } from '../../../src/backend/validation.ts';
import { normalize } from '../../../src/backend/firestore/mappers.ts';
import { adminOrderStore } from '../../src/adminOrderStore.ts';
import { createConfirmationHandler } from '../../src/orderService.ts';

let env;
before(async () => {
  requireLocalEmulators();
  assert.equal(process.env.FUNCTIONS_EMULATOR_HOST, '127.0.0.1:5001');
  env = await environment();
});
after(async () => { await env?.cleanup(); });
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async c => {
    for (const [path, source] of fixtureDocuments().filter(([path]) => path.startsWith('shops/') || path.startsWith('users/'))) {
      await setDoc(doc(c.firestore(), path), path === 'shops/shop-a' ? { ...source, acceptsOrders: true } : source);
    }
  });
});
const errorCode = code => error => error.code === `functions/${code}`;
const pickup = () => ({ shopId: 'shop-a', items: [{ menuItemId: 'fixture-item', quantity: 2 }], fulfillment: 'pickup', couponCode: 'SPICE20' });
async function client() {
  const c = await webClient();
  const functions = getFunctions(c.app, 'us-central1'); connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  return { ...c, quote: httpsCallable(functions, 'createCustomerQuote'), confirm: httpsCallable(functions, 'confirmCustomerOrder'), lookup: httpsCallable(functions, 'getCustomerOrder') };
}
async function quoted(c, data = pickup()) {
  return { quoteId: (await c.quote(data)).data.quoteId, submissionKey: randomUUID() };
}
async function privileged(run) { return env.withSecurityRulesDisabled(c => run(c.firestore())); }
async function patch(path, data) { return privileged(db => updateDoc(doc(db, path), data)); }
async function assertUnconsumed(input) {
  await privileged(async db => {
    assert.equal((await getDoc(doc(db, `customerQuotes/${input.quoteId}`))).data().consumedOrderId, null);
    assert.equal((await getDocs(collection(db, 'orders'))).size, 0);
    assert.equal((await getDocs(collection(db, 'orderSubmissions'))).size, 0);
  });
}
async function withClient(run) { const c = await client(); try { await run(c); } finally { await c.close(); } }

test('pickup confirmation atomically persists canonical unpaid placed order, history, receipt and quote consumption', async () => withClient(async c => {
  const input = await quoted(c); const order = (await c.confirm(input)).data;
  assert.equal(order.data.customerUid, c.auth.currentUser.uid); assert.equal(order.data.status, 'placed');
  assert.deepEqual(order.data.payment, { status: 'unpaid' }); assert.equal(order.data.statusVersion, 1);
  assert.equal(order.data.fulfillment, 'pickup'); assert.equal(order.data.addressSnapshot, null);
  assert.equal(order.data.deliveryFeePaise, 0); assert.equal(order.data.totalPaise, 20800);
  assert.doesNotThrow(() => validateOrder(order.data));
  await privileged(async db => {
    const persisted = (await getDoc(doc(db, `orders/${order.id}`))).data();
    assert.equal(persisted.createdAt instanceof Timestamp, true);
    assert.doesNotThrow(() => validateOrder(normalize(persisted)));
    const events = await getDocs(collection(db, `orders/${order.id}/statusHistory`)); assert.equal(events.size, 1);
    const history = normalize(events.docs[0].data()); validateHistory(history);
    assert.deepEqual(history, { fromStatus: null, toStatus: 'placed', actorUid: c.auth.currentUser.uid, actorRole: 'customer', statusVersion: 1, createdAt: order.data.createdAt });
    assert.equal((await getDoc(doc(db, `customerQuotes/${input.quoteId}`))).data().consumedOrderId, order.id);
    const receipts = await getDocs(collection(db, 'orderSubmissions')); assert.equal(receipts.size, 1);
    assert.equal(receipts.docs[0].data().orderId, order.id);
  });
  const mine = await c.repositories.orders.mine('shop-a'); assert.equal(mine[0].id, order.id);
  assert.equal((await c.repositories.orders.history(order.id)).length, 1);
  assert.deepEqual((await c.lookup({ orderId: order.id })).data, order);
}));
test('delivery confirmation persists the owned saved-address snapshot and server totals', async () => withClient(async c => {
  await setDoc(doc(c.db, `users/${c.auth.currentUser.uid}/addresses/home`), { ...address, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  const input = await quoted(c, { ...pickup(), fulfillment: 'delivery', addressId: 'home' });
  const order = (await c.confirm(input)).data;
  assert.equal(order.data.fulfillment, 'delivery'); assert.deepEqual(order.data.addressSnapshot, address);
  assert.equal(order.data.deliveryFeePaise, 3500); assert.equal(order.data.totalPaise, 24300);
  assert.deepEqual(order.data.payment, { status: 'unpaid' });
}));
test('expired quote is rejected without partial writes', async () => withClient(async c => {
  const input = await quoted(c); await patch(`customerQuotes/${input.quoteId}`, { expiresAt: Timestamp.fromMillis(Date.now() - 1000) });
  await assert.rejects(c.confirm(input), errorCode('failed-precondition')); await assertUnconsumed(input);
}));
test('missing and foreign quotes cannot be confirmed', async () => withClient(async c => {
  await assert.rejects(c.confirm({ quoteId: 'missing', submissionKey: randomUUID() }), errorCode('not-found'));
  const other = await client();
  try { const input = await quoted(other); await assert.rejects(c.confirm(input), errorCode('not-found')); await assertUnconsumed(input); }
  finally { await other.close(); }
}));
test('unauthenticated confirmation and lookup plus invalid HTTP token are rejected', async () => withClient(async c => {
  const input = await quoted(c); await signOut(c.auth);
  await assert.rejects(c.confirm(input), errorCode('unauthenticated'));
  await assert.rejects(c.lookup({ orderId: 'missing' }), errorCode('unauthenticated'));
  const response = await fetch(`http://127.0.0.1:5001/${projectId}/us-central1/confirmCustomerOrder`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer invalid-token' }, body: JSON.stringify({ data: input }) });
  assert.equal(response.status, 401); assert.equal((await response.json()).error.status, 'UNAUTHENTICATED');
  await assertUnconsumed(input);
}));
test('forged identity, pricing, snapshots, payment and status fields are rejected', async () => withClient(async c => {
  const input = await quoted(c);
  for (const key of ['uid', 'customerUid', 'pricePaise', 'totalPaise', 'subtotalPaise', 'status', 'payment', 'items', 'addressSnapshot']) {
    await assert.rejects(c.confirm({ ...input, [key]: 'forged' }), errorCode('invalid-argument'));
  }
  for (const submissionKey of ['', 'short', 'x'.repeat(129), '../' + 'x'.repeat(40), 123]) await assert.rejects(c.confirm({ ...input, submissionKey }), errorCode('invalid-argument'));
  await assertUnconsumed(input);
}));
test('changed menu price or revision requires a fresh quote even when amount is unchanged', async () => withClient(async c => {
  for (const change of [{ pricePaise: 14000 }, { pricePaise: 13000, revision: 2 }]) {
    const input = await quoted(c); await patch('shops/shop-a/menuItems/fixture-item', change);
    await assert.rejects(c.confirm(input), errorCode('failed-precondition')); await assertUnconsumed(input);
  }
}));
test('closed shop, unsupported fulfillment, unavailable/unpublished item and inactive category reject confirmation', async () => withClient(async c => {
  for (const [path, change, restore] of [
    ['shops/shop-a', { acceptsOrders: false }, { acceptsOrders: true }],
    ['shops/shop-a', { fulfillmentOptions: ['delivery'] }, { fulfillmentOptions: ['pickup', 'delivery'] }],
    ['shops/shop-a/menuItems/fixture-item', { available: false }, { available: true }],
    ['shops/shop-a/menuItems/fixture-item', { published: false }, { published: true }],
    ['shops/shop-a/menuCategories/fixture-category', { isActive: false }, { isActive: true }],
  ]) {
    const input = await quoted(c); await patch(path, change);
    await assert.rejects(c.confirm(input), errorCode('failed-precondition')); await assertUnconsumed(input); await patch(path, restore);
  }
}));
test('changed or deleted delivery addresses require a new quote without choosing another address', async () => withClient(async c => {
  const path = `users/${c.auth.currentUser.uid}/addresses/home`;
  await setDoc(doc(c.db, path), { ...address, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  const input = await quoted(c, { ...pickup(), fulfillment: 'delivery', addressId: 'home' });
  await updateDoc(doc(c.db, path), { addressLine: 'Changed street', updatedAt: serverTimestamp() });
  await assert.rejects(c.confirm(input), errorCode('failed-precondition')); await assertUnconsumed(input);
  const next = await quoted(c, { ...pickup(), fulfillment: 'delivery', addressId: 'home' });
  await deleteDoc(doc(c.db, path)); await assert.rejects(c.confirm(next), errorCode('failed-precondition')); await assertUnconsumed(next);
}));
test('invalid policy version, corrupted quote total and noninitial status cannot create an order', async () => withClient(async c => {
  for (const change of [{ policyId: 'unsupported' }, { 'order.totalPaise': 1 }, { 'order.status': 'preparing' }]) {
    const input = await quoted(c); await patch(`customerQuotes/${input.quoteId}`, change);
    await assert.rejects(c.confirm(input), errorCode('failed-precondition')); await assertUnconsumed(input);
  }
}));
test('duplicate retry recovers the successful order even after expiry and menu changes', async () => withClient(async c => {
  const input = await quoted(c); const first = (await c.confirm(input)).data;
  // Discarding the first response and repeating the same input models lost delivery.
  await patch(`customerQuotes/${input.quoteId}`, { expiresAt: Timestamp.fromMillis(0) });
  await patch('shops/shop-a/menuItems/fixture-item', { available: false });
  assert.deepEqual((await c.confirm(input)).data, first);
  await privileged(async db => assert.equal((await getDocs(collection(db, 'orders'))).size, 1));
}));
test('same key with another quote conflicts and consumed quote with a new key is rejected', async () => withClient(async c => {
  const input = await quoted(c); const next = await quoted(c); await c.confirm(input);
  await assert.rejects(c.confirm({ ...next, submissionKey: input.submissionKey }), errorCode('already-exists'));
  await assert.rejects(c.confirm({ ...input, submissionKey: randomUUID() }), errorCode('failed-precondition'));
  await privileged(async db => {
    assert.equal((await getDocs(collection(db, 'orders'))).size, 1);
    assert.equal((await getDoc(doc(db, `customerQuotes/${next.quoteId}`))).data().consumedOrderId, null);
  });
}));
test('concurrent duplicate confirmations create one order, history and receipt', async () => withClient(async c => {
  const input = await quoted(c); const results = await Promise.all(Array.from({ length: 4 }, () => c.confirm(input)));
  assert.equal(new Set(results.map(r => r.data.id)).size, 1);
  await privileged(async db => {
    assert.equal((await getDocs(collection(db, 'orders'))).size, 1);
    assert.equal((await getDocs(collection(db, 'orderSubmissions'))).size, 1);
    assert.equal((await getDocs(collection(db, `orders/${results[0].data.id}/statusHistory`))).size, 1);
  });
}));
test('different concurrent keys cannot consume the same quote twice', async () => withClient(async c => {
  const input = await quoted(c);
  const results = await Promise.allSettled([c.confirm(input), c.confirm({ ...input, submissionKey: randomUUID() })]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(results.find(r => r.status === 'rejected').reason.code, 'functions/failed-precondition');
  await privileged(async db => assert.equal((await getDocs(collection(db, 'orders'))).size, 1));
}));
test('the same submission key is isolated by authenticated UID', async () => withClient(async c => {
  const other = await client();
  try {
    const a = await quoted(c), b = await quoted(other);
    const [one, two] = await Promise.all([c.confirm(a), other.confirm({ ...b, submissionKey: a.submissionKey })]);
    assert.notEqual(one.data.id, two.data.id);
  } finally { await other.close(); }
}));
test('actual transaction abort after all writes are staged leaves no order/history/receipt or consumed quote', async () => withClient(async c => {
  const input = await quoted(c);
  const app = initializeAdmin({ projectId }, 'rollback-only-test'); const db = adminFirestore(app);
  try {
    const store = adminOrderStore(db);
    const failing = { ...store, transaction: run => store.transaction(async tx => { await run(tx); throw new Error('Injected precommit failure'); }) };
    await assert.rejects(createConfirmationHandler(failing, () => { const millis = Date.now(); return { seconds: Math.floor(millis / 1000), nanoseconds: (millis % 1000) * 1000000 }; })({ auth: { uid: c.auth.currentUser.uid }, data: input }), error => error.code === 'unavailable');
    await assertUnconsumed(input);
    await privileged(async db => assert.equal((await getDocs(collection(db, 'orders'))).size, 0));
    assert.equal((await c.confirm(input)).data.data.status, 'placed');
  } finally { await db.terminate(); await deleteAdmin(app); }
}));
test('customer/owner reads remain scoped and all client order/history/receipt writes remain denied', async () => withClient(async c => {
  const input = await quoted(c); const order = (await c.confirm(input)).data;
  const other = await client();
  try {
    await assert.rejects(other.lookup({ orderId: order.id }), errorCode('not-found'));
    assert.deepEqual(await other.repositories.orders.mine('shop-a'), []);
    await assertFails(getDoc(doc(other.db, `orders/${order.id}`)));
    await assertFails(getDoc(doc(other.db, `orders/${order.id}/statusHistory/initial`)));
    const owner = env.authenticatedContext('owner-a').firestore();
    await assertSucceeds(getDoc(doc(owner, `orders/${order.id}`)));
    await assertSucceeds(getDoc(doc(owner, `orders/${order.id}/statusHistory/initial`)));
    await assertFails(getDoc(doc(env.authenticatedContext('owner-b').firestore(), `orders/${order.id}`)));
    for (const db of [c.db, owner]) {
      await assertFails(setDoc(doc(db, 'orders/forged'), order.data));
      await assertFails(updateDoc(doc(db, `orders/${order.id}`), { totalPaise: 1, payment: { status: 'paid' } }));
      await assertFails(deleteDoc(doc(db, `orders/${order.id}`)));
      await assertFails(setDoc(doc(db, `orders/${order.id}/statusHistory/forged`), { toStatus: 'preparing' }));
      await assertFails(updateDoc(doc(db, `orders/${order.id}/statusHistory/initial`), { toStatus: 'preparing' }));
      await assertFails(deleteDoc(doc(db, `orders/${order.id}/statusHistory/initial`)));
      await assertFails(getDocs(collection(db, 'orderSubmissions')));
      await assertFails(setDoc(doc(db, 'orderSubmissions/forged'), { customerUid: c.auth.currentUser.uid }));
    }
  } finally { await other.close(); }
}));
