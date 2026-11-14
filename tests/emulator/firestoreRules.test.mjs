import { before, after, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
import { environment, seed } from './helpers.mjs';
import { address, item, order, profile, history } from './fixtures.mjs';

let env;
before(async () => { env = await environment(); });
after(async () => { await env?.cleanup(); });
beforeEach(async () => { await seed(env); });
const client = uid => uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore();
const stamp = () => ({ createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

test('unauthenticated and unknown-path access is denied by default', async () => {
  const db = client();
  for (const path of ['shops/shop-a', 'shops/shop-a/menuItems/fixture-item', 'users/customer-a', 'orders/fixture-order', 'orders/fixture-order/statusHistory/initial']) await assertFails(getDoc(doc(db, path)));
  await assertFails(setDoc(doc(client('customer-a'), 'unrecognized/path'), { value: true }));
});
test('Admin records require a Firebase Admin claim, not a phone number or profile role', async () => {
  const ref = path => doc(path, 'adminData/restaurant/status');
  await assertFails(getDoc(ref(client())));
  await assertFails(setDoc(ref(client('customer-a')), { open: true }));
  const phoneOnly = env.authenticatedContext('phone-only', { phone_number: '+917644940067', role: 'admin' }).firestore();
  await assertFails(setDoc(ref(phoneOnly), { open: true }));
  const admin = env.authenticatedContext('admin-uid', { admin: true }).firestore();
  await assertSucceeds(setDoc(ref(admin), { open: true }));
  await assertSucceeds(getDoc(ref(admin)));
  await assertFails(getDoc(ref(client('customer-a'))));
});
test('customers can read/update only their own profile and cannot inject owner authority', async () => {
  const db = client('customer-a');
  await assertSucceeds(getDoc(doc(db, 'users/customer-a')));
  await assertSucceeds(updateDoc(doc(db, 'users/customer-a'), { displayName: 'Updated', updatedAt: serverTimestamp() }));
  await assertFails(getDoc(doc(db, 'users/customer-b')));
  await assertFails(updateDoc(doc(db, 'users/customer-b'), { displayName: 'Attack', updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(doc(db, 'users/customer-a'), { role: 'owner', updatedAt: serverTimestamp() }));
  await assertFails(deleteDoc(doc(db, 'users/customer-a')));
  await assertSucceeds(setDoc(doc(client('new-customer'), 'users/new-customer'), { ...profile, ...stamp() }));
});
test('defaultAddressId must identify an existing address in the same customer collection', async () => {
  const db = client('customer-a'), ref = doc(db, 'users/customer-a');
  for (const value of ['missing', 'foreign-home', 'users/customer-b/addresses/foreign-home', '../customer-b']) await assertFails(updateDoc(ref, { defaultAddressId: value, updatedAt: serverTimestamp() }));
  await assertSucceeds(updateDoc(ref, { defaultAddressId: 'home', updatedAt: serverTimestamp() }));
  await assertSucceeds(updateDoc(ref, { defaultAddressId: null, updatedAt: serverTimestamp() }));
});
test('atomic own-address creation/default setting succeeds; deleting a default without clearing fails', async () => {
  const db = client('customer-a');
  const add = writeBatch(db);
  add.set(doc(db, 'users/customer-a/addresses/new-home'), { ...address, ...stamp() });
  add.update(doc(db, 'users/customer-a'), { defaultAddressId: 'new-home', updatedAt: serverTimestamp() });
  await assertSucceeds(add.commit());
  await assertFails(deleteDoc(doc(db, 'users/customer-a/addresses/new-home')));
  const remove = writeBatch(db);
  remove.update(doc(db, 'users/customer-a'), { defaultAddressId: null, updatedAt: serverTimestamp() });
  remove.delete(doc(db, 'users/customer-a/addresses/new-home'));
  await assertSucceeds(remove.commit());
});
test('customers cannot create/update/read/delete another customer address', async () => {
  const db = client('customer-a'), ref = doc(db, 'users/customer-b/addresses/foreign-home');
  await assertFails(getDoc(ref)); await assertFails(setDoc(ref, { ...address, ...stamp() }));
  await assertFails(updateDoc(ref, { city: 'Attack', updatedAt: serverTimestamp() })); await assertFails(deleteDoc(ref));
  await assertSucceeds(setDoc(doc(db, 'users/customer-a/addresses/new-home'), { ...address, ...stamp() }));
  await assertFails(setDoc(doc(db, 'users/customer-a/addresses/invalid'), { ...address, pincode: '000000', ...stamp() }));
  await assertFails(setDoc(doc(db, 'users/customer-a/addresses/blank'), { ...address, addressLine: '   ', ...stamp() }));
});
test('address document IDs match repository ASCII/length rules for both create and update', async () => {
  const db = client('customer-a');
  for (const addressId of ['A', 'home_1-A', 'x'.repeat(128)]) {
    const ref = doc(db, `users/customer-a/addresses/${addressId}`);
    await assertSucceeds(setDoc(ref, { ...address, ...stamp() }));
    await assertSucceeds(updateDoc(ref, { city: 'Updated city', updatedAt: serverTimestamp() }));
  }
  for (const addressId of ['home.address', 'with space', 'नाम', 'x'.repeat(129), 'home\n']) {
    await assertFails(setDoc(doc(db, `users/customer-a/addresses/${addressId}`), { ...address, ...stamp() }));
  }
});
test('preexisting malformed address IDs cannot be updated even with valid document fields', async () => {
  await env.withSecurityRulesDisabled(async ctx => {
    await setDoc(doc(ctx.firestore(), 'users/customer-a/addresses/bad.id'), { ...address, createdAt: profile.createdAt, updatedAt: profile.updatedAt });
  });
  const db = client('customer-a'), ref = doc(db, 'users/customer-a/addresses/bad.id');
  // Supply a fully valid replacement so the only rejection reason is its ID.
  await assertFails(setDoc(ref, { ...address, createdAt: profile.createdAt, updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(ref, { city: 'Updated city', updatedAt: serverTimestamp() }));
});
test('published menu and active category reads require constrained customer queries', async () => {
  const db = client('customer-a');
  await assertSucceeds(getDoc(doc(db, 'shops/shop-a/menuItems/fixture-item')));
  await assertFails(getDoc(doc(db, 'shops/shop-a/menuItems/unpublished')));
  await assertSucceeds(getDocs(query(collection(db, 'shops/shop-a/menuItems'), where('published', '==', true))));
  await assertFails(getDocs(collection(db, 'shops/shop-a/menuItems')));
  await assertSucceeds(getDocs(query(collection(db, 'shops/shop-a/menuCategories'), where('isActive', '==', true))));
  await assertFails(getDoc(doc(db, 'shops/shop-a/menuCategories/inactive')));
});
test('only active owners of the correct shop can edit price/availability and read drafts', async () => {
  for (const uid of ['customer-a', 'inactive-owner', 'owner-b']) {
    await assertFails(updateDoc(doc(client(uid), 'shops/shop-a/menuItems/fixture-item'), { pricePaise: 14000, revision: 2, updatedAt: serverTimestamp() }));
  }
  const db = client('owner-a'), ref = doc(db, 'shops/shop-a/menuItems/fixture-item');
  await assertSucceeds(getDoc(doc(db, 'shops/shop-a/menuItems/unpublished')));
  await assertSucceeds(updateDoc(ref, { pricePaise: 14000, available: false, revision: 2, updatedAt: serverTimestamp() }));
  assert.equal((await getDoc(ref)).data().pricePaise, 14000);
});
test('owner rules reject stale revisions and invalid price/availability values', async () => {
  const ref = doc(client('owner-a'), 'shops/shop-a/menuItems/fixture-item');
  for (const patch of [{ revision: 1, pricePaise: 14000 }, { revision: 3, pricePaise: 14000 }, { revision: 2, pricePaise: -1 }, { revision: 2, pricePaise: 1.5 }, { revision: 2, available: 'false' }]) await assertFails(updateDoc(ref, { ...patch, updatedAt: serverTimestamp() }));
  await assertSucceeds(updateDoc(ref, { available: false, revision: 2, updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(ref, { pricePaise: 15000, revision: 2, updatedAt: serverTimestamp() }));
});
test('owners cannot change protected catalog fields or add/delete/replace items', async () => {
  const db = client('owner-a'), ref = doc(db, 'shops/shop-a/menuItems/fixture-item');
  for (const patch of [{ name: 'Renamed' }, { categoryId: 'other' }, { imageAssetKey: 'other.jpg' }, { description: 'Changed' }, { isVeg: false }, { availabilityNote: 'Changed' }, { published: false }, { sortOrder: 99 }, { currency: 'USD' }, { id: 'other' }]) await assertFails(updateDoc(ref, { ...patch, revision: 2, updatedAt: serverTimestamp() }));
  await assertFails(setDoc(doc(db, 'shops/shop-a/menuItems/new-id'), { ...item, ...stamp() }));
  await assertFails(deleteDoc(ref));
  await assertFails(setDoc(ref, { name: 'Replacement', revision: 2, updatedAt: serverTimestamp() }));
});
test('membership grants, edits and deletion are denied even for owners; email/claims grant nothing', async () => {
  for (const uid of ['customer-a', 'owner-a']) {
    const db = client(uid), ref = doc(db, `shops/shop-a/members/${uid}`);
    await assertFails(setDoc(ref, { role: 'owner', active: true })); await assertFails(deleteDoc(ref));
  }
  const db = env.authenticatedContext('email-only', { email: 'fixture@example.invalid', role: 'owner', admin: true }).firestore();
  await assertFails(updateDoc(doc(db, 'shops/shop-a/menuItems/fixture-item'), { pricePaise: 14000, revision: 2, updatedAt: serverTimestamp() }));
  await assertSucceeds(getDoc(doc(client('owner-a'), 'shops/shop-a/members/owner-a')));
  await assertFails(getDoc(doc(client('customer-a'), 'shops/shop-a/members/owner-a')));
});
test('customer and owner order queries are scoped; foreign order/history reads are denied', async () => {
  const customer = client('customer-a'), owner = client('owner-a');
  for (const db of [customer, owner]) {
    await assertSucceeds(getDoc(doc(db, 'orders/fixture-order')));
    await assertSucceeds(getDoc(doc(db, 'orders/fixture-order/statusHistory/initial')));
    await assertFails(getDoc(doc(db, 'orders/foreign-order')));
    await assertFails(getDocs(collection(db, 'orders')));
  }
  await assertSucceeds(getDocs(query(collection(customer, 'orders'), where('customerUid', '==', 'customer-a'), where('shopId', '==', 'shop-a'))));
  await assertSucceeds(getDocs(query(collection(owner, 'orders'), where('shopId', '==', 'shop-a'))));
});
test('no customer or owner can create orders or write totals, payment, statuses or history', async () => {
  for (const uid of ['customer-a', 'owner-a']) {
    const db = client(uid), ref = doc(db, 'orders/fixture-order'), event = doc(db, 'orders/fixture-order/statusHistory/initial');
    await assertFails(setDoc(doc(db, 'orders/new-order'), { ...order, ...stamp() }));
    for (const patch of [{ totalPaise: 1 }, { payment: { status: 'paid' } }, { status: 'preparing' }]) await assertFails(updateDoc(ref, patch));
    await assertFails(deleteDoc(ref)); await assertFails(setDoc(event, history)); await assertFails(deleteDoc(event));
    await assertFails(setDoc(doc(db, 'orders/fixture-order/statusHistory/new-event'), history));
  }
});
