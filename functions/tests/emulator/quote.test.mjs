import { before, after, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { assertFails } from '@firebase/rules-unit-testing';
import { signOut } from 'firebase/auth';
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { environment, webClient } from '../../../tests/emulator/helpers.mjs';
import { fixtureDocuments, address, time } from '../../../tests/emulator/fixtures.mjs';

// REAL suite: this file is intentionally excluded from pure unit-test scripts.
// Only the Java-gated functions/scripts/run-emulators.mjs runs it.
let env;
before(async () => {
  if (process.env.FUNCTIONS_EMULATOR_HOST !== '127.0.0.1:5001') throw new Error('Explicit Functions emulator required.');
  env = await environment();
});
after(async () => { await env?.cleanup(); });
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async context => {
    // Quote tests need shop/menu/address fixtures only. No orders are seeded here.
    for (const [path, source] of fixtureDocuments().filter(([path]) => path.startsWith('shops/') || path.startsWith('users/'))) {
      const data = path === 'shops/shop-a' ? { ...source, acceptsOrders: true } : source;
      await setDoc(doc(context.firestore(), path), data);
    }
  });
});
const data = () => ({ shopId: 'shop-a', items: [{ menuItemId: 'fixture-item', quantity: 2 }], fulfillment: 'pickup' });
async function client() {
  const c = await webClient();
  const functions = getFunctions(c.app, 'us-central1');
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  return { ...c, call: httpsCallable(functions, 'createCustomerQuote') };
}
const errorCode = code => error => error.code === `functions/${code}`;

test('real callable rejects missing authentication and forged UID/price fields', async () => {
  const c = await client();
  try {
    for (const extra of [{ customerUid: 'customer-b' }, { totalPaise: 1 }]) await assert.rejects(c.call({ ...data(), ...extra }), errorCode('invalid-argument'));
    await signOut(c.auth);
    await assert.rejects(c.call(data()), errorCode('unauthenticated'));
  } finally { await c.close(); }
});
test('real HTTP callable rejects an invalid authentication token', async () => {
  const response = await fetch('http://127.0.0.1:5001/demo-desiibites-stage1/us-central1/createCustomerQuote', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer invalid-token' },
    body: JSON.stringify({ data: data() }),
  });
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error.status, 'UNAUTHENTICATED');
});
test('real callable persists a UID-bound expiring pickup quote using canonical prices', async () => {
  const c = await client();
  try {
    const review = (await c.call({ ...data(), couponCode: 'SPICE20' })).data;
    assert.equal(review.totalPaise, 20800); assert.equal(review.deliveryFeePaise, 0); assert.equal(review.addressSnapshot, null);
    await env.withSecurityRulesDisabled(async context => {
      const stored = (await getDoc(doc(context.firestore(), `customerQuotes/${review.quoteId}`))).data();
      assert.equal(stored.customerUid, c.auth.currentUser.uid);
      assert.equal(stored.order.items[0].unitPricePaise, 13000); assert.equal(stored.policyId, 'test-only-demo-v1');
      assert.equal(stored.expiresAt.seconds - stored.createdAt.seconds, 300);
      assert.equal(stored.expiresAt.toMillis() > Date.now(), true);
      assert.equal((await getDocs(collection(context.firestore(), 'orders'))).empty, true);
    });
  } finally { await c.close(); }
});
test('real delivery quotes use owned saved addresses and reject foreign or missing references', async () => {
  const c = await client();
  try {
    const delivery = { ...data(), fulfillment: 'delivery' };
    await assert.rejects(c.call(delivery), errorCode('invalid-argument'));
    for (const addressId of ['missing', 'foreign-home']) await assert.rejects(c.call({ ...delivery, addressId }), errorCode('failed-precondition'));
    await setDoc(doc(c.db, `users/${c.auth.currentUser.uid}/addresses/home`), { ...address, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    const review = (await c.call({ ...delivery, addressId: 'home' })).data;
    assert.equal(review.addressSnapshot.addressLine, address.addressLine); assert.equal(review.totalPaise, 29500);
  } finally { await c.close(); }
});
test('real callable rejects unavailable/unpublished items and inactive categories', async () => {
  const c = await client();
  try {
    for (const patch of [{ available: false }, { available: true, published: false }]) {
      await env.withSecurityRulesDisabled(async context => updateDoc(doc(context.firestore(), 'shops/shop-a/menuItems/fixture-item'), patch));
      await assert.rejects(c.call(data()), errorCode('failed-precondition'));
    }
    await env.withSecurityRulesDisabled(async context => {
      await updateDoc(doc(context.firestore(), 'shops/shop-a/menuItems/fixture-item'), { available: true, published: true });
      await updateDoc(doc(context.firestore(), 'shops/shop-a/menuCategories/fixture-category'), { isActive: false });
    });
    await assert.rejects(c.call(data()), errorCode('failed-precondition'));
  } finally { await c.close(); }
});
test('quote documents deny client read/list/create/update/delete, including their owner', async () => {
  const c = await client();
  try {
    const review = (await c.call(data())).data;
    for (const uid of [c.auth.currentUser.uid, 'customer-b', 'owner-a', null]) {
      const db = uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore();
      const ref = doc(db, `customerQuotes/${review.quoteId}`);
      await assertFails(getDoc(ref)); await assertFails(getDocs(collection(db, 'customerQuotes')));
      await assertFails(setDoc(doc(db, 'customerQuotes/forged'), { customerUid: uid, expiresAt: time }));
      await assertFails(updateDoc(ref, { customerUid: 'attacker', totalPaise: 1 })); await assertFails(deleteDoc(ref));
    }
  } finally { await c.close(); }
});
