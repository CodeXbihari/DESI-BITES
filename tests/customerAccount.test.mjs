import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { createRepositories } from '../src/backend/createRepositories.ts';
import { buildRepositories } from '../src/backend/firestore/repositories.ts';
import { createCustomerAccountSession, selectedCustomerAddress, formatCustomerAddress, hasValidDeliveryAddress } from '../src/services/customerAccount.ts';

const address = { label: 'Home', addressLine: 'Room 12', area: 'College campus', city: 'Patna', pincode: '800001', deliveryInstructions: 'Call at the gate' };
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
async function fixture(uid = 'customer-a') {
  let currentUid = uid;
  const repository = await createRepositories({ authMode: 'mock', platform: 'web', demoUid: uid });
  const binding = { repository, getUid: () => uid };
  const session = createCustomerAccountSession(uid, () => currentUid, async () => binding);
  return { repository, binding, session, switchUid: value => { currentUid = value; }, getUid: () => currentUid };
}
async function started(f) { f.session.start(); await setImmediate(); return f.session; }

test('loading/empty state performs reads only; explicit profile save creates and reloads the authenticated profile', async () => {
  const f = await fixture(), states = [];
  let saves = 0; const save = f.repository.profile.save;
  f.repository.profile.save = async input => { saves++; return save(input); };
  f.session.subscribe(() => states.push(f.session.getSnapshot()));
  f.session.start();
  assert.equal(f.session.getSnapshot().loading, true);
  await assert.rejects(() => f.session.saveProfile('Premature'), /Wait/);
  await setImmediate();
  assert.equal(saves, 0);
  assert.equal(f.session.getSnapshot().profile, null);
  assert.deepEqual(f.session.getSnapshot().addresses, []);
  await f.session.saveProfile('  Customer A  ');
  assert.equal(f.session.getSnapshot().profile.id, 'customer-a');
  assert.equal(f.session.getSnapshot().profile.data.displayName, 'Customer A');
  assert.equal(saves, 1);
  assert.ok(states.some(state => state.busy));
  f.session.dispose();
});

test('profile load failures do not save defaults; retry recovers the existing profile', async () => {
  const f = await fixture();
  await f.repository.profile.save({ displayName: 'Existing name', defaultAddressId: null });
  const get = f.repository.profile.get; let fail = true, writes = 0;
  f.repository.profile.get = async () => { if (fail) throw new Error('offline'); return get(); };
  f.repository.profile.save = async () => { writes++; };
  await started(f);
  assert.ok(f.session.getSnapshot().error);
  await assert.rejects(() => f.session.saveProfile(''), /Wait/);
  assert.equal(writes, 0);
  fail = false; await f.session.retry();
  assert.equal(f.session.getSnapshot().error, null);
  assert.equal(f.session.getSnapshot().profile.data.displayName, 'Existing name');
  f.session.dispose();
});

test('addresses add/edit/default/delete persist through the actual demo repository and refresh selection', async () => {
  const f = await fixture(), session = await started(f);
  await session.saveProfile('Customer A');
  await session.saveAddress('home', address);
  assert.equal(session.getSnapshot().selectedAddressId, 'home');
  assert.deepEqual(selectedCustomerAddress(session.getSnapshot()).data.deliveryInstructions, 'Call at the gate');
  await session.setDefaultAddress('home');
  await session.saveProfile('Updated name');
  assert.equal(session.getSnapshot().profile.data.defaultAddressId, 'home');
  await session.saveAddress('home', { ...address, addressLine: 'Room 20' });
  assert.equal(session.getSnapshot().addresses.length, 1);
  assert.equal(selectedCustomerAddress(session.getSnapshot()).data.addressLine, 'Room 20');
  // Recreate the UI session against the same repository: data is not held only
  // in React state, and a saved default is restored from the profile.
  session.dispose();
  const restored = createCustomerAccountSession('customer-a', () => 'customer-a', async () => f.binding);
  restored.start(); await setImmediate();
  assert.equal(restored.getSnapshot().selectedAddressId, 'home');
  await restored.removeAddress('home');
  assert.deepEqual(restored.getSnapshot().addresses, []);
  assert.equal(restored.getSnapshot().selectedAddressId, null);
  assert.equal(restored.getSnapshot().profile.data.defaultAddressId, null);
  assert.equal(restored.getSnapshot().profile.data.displayName, 'Updated name');
  restored.dispose();
});

test('address validation rejects incomplete fields, invalid PIN, path injection and extra ownership fields', async () => {
  const f = await fixture(), session = await started(f);
  for (const invalid of [{ ...address, addressLine: ' ' }, { ...address, area: '' }, { ...address, city: '' }, { ...address, pincode: '000000' }, { ...address, uid: 'customer-b' }]) {
    await assert.rejects(() => session.saveAddress('home', invalid));
  }
  await assert.rejects(() => session.saveAddress('../other', address));
  await assert.rejects(() => session.removeAddress('unknown'));
  assert.throws(() => session.selectAddress('unknown'));
  assert.deepEqual(await f.repository.addresses.list(), []);
  session.dispose();
});

test('address read and write failures clear readiness; retry reloads without a demo fallback', async () => {
  const f = await fixture(); const list = f.repository.addresses.list; let failRead = true;
  f.repository.addresses.list = async () => { if (failRead) throw new Error('offline'); return list(); };
  const session = await started(f);
  assert.ok(session.getSnapshot().error);
  failRead = false; await session.retry();
  assert.deepEqual(session.getSnapshot().addresses, []);
  const save = f.repository.addresses.save;
  f.repository.addresses.save = async () => { throw new Error('denied'); };
  await assert.rejects(() => session.saveAddress('home', address));
  assert.equal(hasValidDeliveryAddress(session.getSnapshot()), false);
  f.repository.addresses.save = save;
  await session.retry(); await session.saveAddress('home', address);
  assert.equal(hasValidDeliveryAddress(session.getSnapshot()), true);
  session.dispose();
});

test('profile save failure preserves repository data and retry restores it', async () => {
  const f = await fixture(); await f.repository.profile.save({ displayName: 'Original', defaultAddressId: null });
  const session = await started(f);
  f.repository.profile.save = async () => { throw new Error('denied'); };
  await assert.rejects(() => session.saveProfile('Replacement'));
  assert.ok(session.getSnapshot().error);
  await session.retry();
  assert.equal(session.getSnapshot().profile.data.displayName, 'Original');
  session.dispose();
});

test('separate authenticated UIDs cannot select, edit through reads, or delete another customer address', async () => {
  const a = await fixture('customer-a'), b = await fixture('customer-b');
  await started(a); await started(b);
  await a.session.saveAddress('a-home', address);
  assert.deepEqual(b.session.getSnapshot().addresses, []);
  assert.throws(() => b.session.selectAddress('a-home'));
  await assert.rejects(() => b.session.removeAddress('a-home'));
  // Same document ID is scoped to B's own users/B/addresses collection.
  await b.session.saveAddress('a-home', { ...address, addressLine: 'B only' });
  assert.equal((await a.repository.addresses.list())[0].data.addressLine, 'Room 12');
  assert.equal((await b.repository.addresses.list())[0].data.addressLine, 'B only');
  a.session.dispose(); b.session.dispose();
});

test('real shared repository paths derive from SDK UID and mismatched SDK binding fails closed', async () => {
  let sdkUid = 'customer-a'; const calls = [];
  const repository = buildRepositories({ uid: () => sdkUid, get: async path => { calls.push(path); return null; }, list: async path => { calls.push(path); return []; }, transaction: async () => { throw new Error('unexpected write'); }, serverTimestamp: () => ({}) });
  const session = createCustomerAccountSession('customer-a', () => 'customer-a', async () => ({ repository, getUid: () => sdkUid }));
  session.start(); await setImmediate();
  assert.deepEqual(calls.sort(), ['users/customer-a', 'users/customer-a/addresses']);
  sdkUid = 'customer-b';
  await assert.rejects(() => session.saveAddress('home', address), /session changed/);
  await session.retry();
  assert.ok(session.getSnapshot().error);
  assert.equal(calls.length, 2);
  session.dispose();
});

test('a profile returned for another UID is never exposed', async () => {
  const f = await fixture(); await f.repository.profile.save({ displayName: 'A', defaultAddressId: null });
  const get = f.repository.profile.get;
  f.repository.profile.get = async () => ({ ...await get(), id: 'customer-b' });
  await started(f);
  assert.equal(f.session.getSnapshot().profile, null);
  assert.ok(f.session.getSnapshot().error);
  f.session.dispose();
});

test('logout/account switch suppresses late reads and prevents further old-session operations', async () => {
  for (const next of [null, 'customer-b']) {
    const f = await fixture(); const waiting = deferred();
    f.repository.addresses.list = () => waiting.promise;
    const seen = []; f.session.subscribe(() => seen.push(f.session.getSnapshot()));
    f.session.start(); await setImmediate();
    f.switchUid(next); f.session.dispose();
    const count = seen.length;
    waiting.resolve([]); await setImmediate();
    assert.equal(seen.length, count);
    assert.deepEqual(f.session.getSnapshot().addresses, []);
    await assert.rejects(() => f.session.saveProfile('Old account'), /session changed/);
    await f.session.retry();
    assert.equal(seen.length, count);
  }
});

test('newer retries win when reads complete out of order', async () => {
  const f = await fixture(); const first = deferred(), second = deferred(); let calls = 0;
  f.repository.addresses.list = () => (++calls === 1 ? first.promise : second.promise);
  f.session.start(); await setImmediate();
  const retry = f.session.retry(); await setImmediate();
  second.resolve([]); await retry;
  const latest = f.session.getSnapshot();
  first.reject(new Error('late failure')); await setImmediate();
  assert.equal(f.session.getSnapshot(), latest);
  assert.equal(latest.error, null);
  f.session.dispose();
});

test('Home selection is the same repository-backed address used for Checkout delivery validation', async () => {
  const f = await fixture(), session = await started(f);
  assert.equal(hasValidDeliveryAddress(session.getSnapshot()), false);
  await session.saveAddress('home', address);
  await session.saveAddress('work', { ...address, label: 'Work', addressLine: 'Library' });
  session.selectAddress('home');
  assert.match(formatCustomerAddress(selectedCustomerAddress(session.getSnapshot()).data), /Room 12/);
  assert.equal(hasValidDeliveryAddress(session.getSnapshot()), true);
  session.selectAddress('work');
  assert.match(formatCustomerAddress(selectedCustomerAddress(session.getSnapshot()).data), /Library/);
  await session.removeAddress('work');
  assert.equal(selectedCustomerAddress(session.getSnapshot()), null);
  assert.equal(hasValidDeliveryAddress(session.getSnapshot()), false);
  session.dispose();
});

test('guest sessions do not initialize repositories or allow writes', async () => {
  let loads = 0;
  const session = createCustomerAccountSession(null, () => null, async () => { loads++; throw new Error('must not load'); });
  session.start(); await setImmediate();
  assert.equal(session.getSnapshot().loading, false);
  await assert.rejects(() => session.saveProfile('Guest'));
  assert.equal(loads, 0);
  session.dispose();
});

test('pending mutations are serialized and cannot refresh a new account after logout', async () => {
  const f = await fixture(), session = await started(f), pending = deferred();
  let reads = 0;
  const get = f.repository.profile.get;
  f.repository.profile.get = async () => { reads++; return get(); };
  f.repository.profile.save = () => pending.promise;
  const save = session.saveProfile('Old account');
  assert.equal(session.getSnapshot().busy, true);
  await assert.rejects(() => session.saveAddress('home', address), /Wait/);
  f.switchUid('customer-b'); session.dispose();
  pending.resolve();
  await assert.rejects(() => save, /session changed/);
  assert.equal(reads, 0);
  assert.equal(session.getSnapshot().profile, null);
});

test('explicit emulator binding failure never substitutes a demo repository', async () => {
  const session = createCustomerAccountSession('customer-a', () => 'customer-a', async () => { throw new Error('emulator unavailable'); });
  session.start(); await setImmediate();
  assert.ok(session.getSnapshot().error);
  await assert.rejects(() => session.saveAddress('home', address), /Wait/);
  assert.deepEqual(session.getSnapshot().addresses, []);
  session.dispose();
});

async function nonDefaultSelection() {
  const f = await fixture(), session = await started(f);
  await session.saveProfile('Customer A');
  await session.saveAddress('default', address);
  await session.setDefaultAddress('default');
  await session.saveAddress('chosen', { ...address, addressLine: 'Chosen room' });
  assert.equal(session.getSnapshot().profile.data.defaultAddressId, 'default');
  assert.equal(session.getSnapshot().selectedAddressId, 'chosen');
  return f;
}

test('failed name save and repeated failed retries preserve the non-default selection intent', async () => {
  const f = await nonDefaultSelection();
  const save = f.repository.profile.save, get = f.repository.profile.get;
  f.repository.profile.save = async () => { throw new Error('name save failed'); };
  await assert.rejects(() => f.session.saveProfile('New name'));
  assert.equal(f.session.getSnapshot().selectedAddressId, null, 'error snapshots must not expose stale data');
  f.repository.profile.get = async () => { throw new Error('still offline'); };
  await f.session.retry(); await f.session.retry();
  f.repository.profile.get = get; f.repository.profile.save = save;
  await f.session.retry();
  assert.equal(f.session.getSnapshot().selectedAddressId, 'chosen');
  assert.equal(f.session.getSnapshot().profile.data.defaultAddressId, 'default');
  assert.equal(f.session.getSnapshot().selectionNotice, null);
  f.session.dispose();
});

test('failed address mutations preserve selection; an ambiguous successful write does not select its new address on retry', async () => {
  const f = await nonDefaultSelection();
  const save = f.repository.addresses.save, list = f.repository.addresses.list;
  f.repository.addresses.save = async () => { throw new Error('write failed'); };
  await assert.rejects(() => f.session.saveAddress('chosen', { ...address, addressLine: 'Changed' }, true));
  f.repository.addresses.save = save;
  await f.session.retry();
  assert.equal(f.session.getSnapshot().selectedAddressId, 'chosen');
  f.repository.addresses.list = async () => { throw new Error('post-write refresh failed'); };
  await assert.rejects(() => f.session.saveAddress('new', { ...address, addressLine: 'New room' }));
  f.repository.addresses.list = list;
  await f.session.retry();
  assert.ok(f.session.getSnapshot().addresses.some(address => address.id === 'new'), 'the ambiguous write really saved');
  assert.equal(f.session.getSnapshot().selectedAddressId, 'chosen');
  assert.equal(f.session.getSnapshot().profile.data.defaultAddressId, 'default');
  f.session.dispose();
});

for (const origin of ['this view', 'another view']) {
  test(`selected address deleted from ${origin} requires selection instead of restoring the default`, async () => {
    const f = await nonDefaultSelection();
    if (origin === 'this view') await f.session.removeAddress('chosen');
    else { await f.repository.addresses.remove('chosen'); await f.session.retry(); }
    assert.equal(f.session.getSnapshot().selectedAddressId, null);
    assert.match(f.session.getSnapshot().selectionNotice, /Select a saved address/);
    assert.equal(hasValidDeliveryAddress(f.session.getSnapshot()), false);
    await f.session.retry(); await f.session.retry();
    assert.equal(f.session.getSnapshot().selectedAddressId, null, 'later retries must not silently choose the default');
    assert.ok(f.session.getSnapshot().selectionNotice);
    f.session.selectAddress('default');
    assert.equal(f.session.getSnapshot().selectedAddressId, 'default');
    assert.equal(f.session.getSnapshot().selectionNotice, null);
    f.session.dispose();
  });
}

test('a fresh session still restores its persisted default rather than carrying prior selection intent', async () => {
  const f = await nonDefaultSelection();
  f.session.dispose();
  const fresh = createCustomerAccountSession('customer-a', () => 'customer-a', async () => f.binding);
  fresh.start(); await setImmediate();
  assert.equal(fresh.getSnapshot().selectedAddressId, 'default');
  assert.equal(fresh.getSnapshot().selectionNotice, null);
  fresh.dispose();
});

test('edit-only saves reject deleted IDs while normal add and edit remain supported', async () => {
  const f = await fixture(), session = await started(f);
  await session.saveAddress('home', address);
  await session.saveAddress('home', { ...address, addressLine: 'Edited' }, true);
  assert.equal(session.getSnapshot().addresses.length, 1);
  await session.removeAddress('home');
  await assert.rejects(() => session.saveAddress('home', address, true), /no longer available/);
  assert.deepEqual(await f.repository.addresses.list(), []);
  await session.saveAddress('new', address);
  assert.equal(session.getSnapshot().selectedAddressId, 'new');
  session.dispose();
});

test('account switching cannot restore another account selection after a pending retry', async () => {
  const a = await nonDefaultSelection(), waiting = deferred();
  a.repository.addresses.list = () => waiting.promise;
  const retry = a.session.retry(); await setImmediate();
  a.switchUid('customer-b'); a.session.dispose();
  const b = await fixture('customer-b'), session = await started(b);
  await session.saveProfile('Customer B');
  await session.saveAddress('b-default', address);
  await session.setDefaultAddress('b-default');
  waiting.resolve([]); await retry;
  assert.equal(session.getSnapshot().selectedAddressId, 'b-default');
  assert.equal(a.session.getSnapshot().selectedAddressId, null);
  session.dispose();
});
