import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { setImmediate } from 'node:timers/promises';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRepositories } from '../src/backend/createRepositories.ts';
import * as service from '../src/services/customerAccount.ts';

const require = createRequire(import.meta.url), babel = require('@babel/core'), native = require('react-native-web');
const root = path.resolve(import.meta.dirname, '..'), cache = new Map();
let account, app, buttons;
// Render actual consumers, matching the existing checkout/Reorder SSR approach.
// Context values and asset/platform wrappers are substituted. No React effects
// or mounted-provider/browser lifecycle claims are made.
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} }; cache.set(file, module);
  const { code } = babel.transformSync(fs.readFileSync(file, 'utf8'), { filename: file, babelrc: false, configFile: false,
    presets: ['@babel/preset-typescript'], plugins: ['@babel/plugin-transform-react-jsx', '@babel/plugin-transform-modules-commonjs'] });
  const localRequire = id => {
    if (id === 'react-native') return { ...native, TouchableOpacity: props => { buttons.push(props); return React.createElement(native.TouchableOpacity, props); } };
    if (id === '../context/CustomerAccountContext') return { useCustomerAccount: () => account };
    if (id === '../context/AppContext') return { useApp: () => app };
    if (id === '../context/CustomerOrdersContext') return { useCustomerOrders: () => ({ enabled: true, restoring: false, phase: 'idle', attempt: null, success: null, updateDraft() {} }) };
    if (id === '../context/AuthContext') return { useAuth: () => ({ user: { uid: account.uid, displayName: 'Auth name', phoneNumber: '+919000000000' } }) };
    if (id === '../services/customerAccount') return service;
    if (id === '@expo/vector-icons') return { Ionicons: () => null };
    if (id === 'react-native-safe-area-context') return { SafeAreaView: native.View };
    if (id === 'expo-status-bar') return { StatusBar: () => null };
    if (/\.(jpg|png)$/.test(id)) return { uri: 'data:image/png;base64,' };
    if (id.startsWith('.')) {
      const target = path.resolve(path.dirname(file), id);
      for (const extension of ['.ts', '.tsx']) if (fs.existsSync(target + extension)) return load(target + extension);
    }
    return require(id);
  };
  new Function('require', 'module', 'exports', code)(localRequire, module, module.exports);
  return module.exports;
}
const { Header } = load(path.join(root, 'src/components/Header.tsx'));
const { SavedAddresses, SavedAddressEditor, CustomerProfileEditor } = load(path.join(root, 'src/components/CustomerAccountUI.tsx'));
const { CheckoutScreen } = load(path.join(root, 'src/screens/CheckoutScreen.tsx'));
const address = { label: 'Home', addressLine: 'Room 12', area: 'Campus', city: 'Patna', pincode: '800001', deliveryInstructions: '' };
function render(Component, snapshot, props = {}, methods = {}) {
  buttons = [];
  account = { ...snapshot, selectedAddress: service.selectedCustomerAddress(snapshot), retry() {}, saveProfile() {}, selectAddress() {}, ...methods };
  app = { fulfillment: 'delivery', deliveryAddressDraft: service.formatCustomerAddress(account.selectedAddress?.data ?? null), searchQuery: '', setSearchQuery() {}, cartCount: 1, setIsCartOpen() {},
    cart: [{ product: { id: 'fixture', name: 'Dish', price: 120, image: '' }, quantity: 1 }], updateQuantity() {}, cartSubtotal: 120, deliveryFee: 35,
    appliedDiscount: 0, appliedCoupon: null, applyCoupon() {}, removeCoupon() {}, finalTotal: 155, setFulfillment() {} };
  return renderToStaticMarkup(React.createElement(Component, props));
}
const empty = { uid: 'customer-a', source: 'demo', profile: null, addresses: [], selectedAddressId: null, loading: false, busy: false, error: null };

test('Profile/address consumers distinguish loading, missing data and repository errors; retry is wired to context', () => {
  const loading = render(CustomerProfileEditor, { ...empty, loading: true });
  assert.match(loading, /Loading profile and addresses/);
  assert.equal(buttons.find(button => button.accessibilityLabel === 'Edit profile name').disabled, true);
  assert.match(render(CustomerProfileEditor, empty), /No saved profile yet/);
  assert.match(render(SavedAddresses, empty), /No saved addresses yet/);
  let retries = 0;
  const failed = render(SavedAddresses, { ...empty, error: 'Repository offline' }, {}, { retry: () => { retries++; } });
  assert.match(failed, /Repository offline/);
  assert.doesNotMatch(failed, /No saved addresses yet/);
  buttons.find(button => button.children?.props?.children === 'Retry loading').onPress();
  assert.equal(retries, 1);
  assert.equal(buttons.find(button => button.accessibilityLabel === 'Add new address').disabled, true);
});

test('actual address selection callback updates the same session rendered by Home and Checkout', async () => {
  const repository = await createRepositories({ authMode: 'mock', platform: 'web', demoUid: 'customer-a' });
  const session = service.createCustomerAccountSession('customer-a', () => 'customer-a', async () => ({ repository, getUid: () => 'customer-a' }));
  session.start(); await setImmediate();
  await session.saveAddress('home', address);
  await session.saveAddress('work', { ...address, label: 'Work', addressLine: 'Library', city: 'Gaya' });
  const methods = { selectAddress: session.selectAddress };
  render(SavedAddresses, session.getSnapshot(), {}, methods);
  buttons.find(button => button.accessibilityLabel === 'Use address home').onPress();
  assert.match(render(Header, session.getSnapshot(), { variant: 'home' }, methods), /Patna/);
  assert.match(render(CheckoutScreen, session.getSnapshot(), {}, methods), /Room 12, Campus, Patna/);
  render(SavedAddresses, session.getSnapshot(), {}, methods);
  buttons.find(button => button.accessibilityLabel === 'Use address work').onPress();
  assert.match(render(Header, session.getSnapshot(), { variant: 'home' }, methods), /Gaya/);
  const checkout = render(CheckoutScreen, session.getSnapshot(), {}, methods);
  assert.match(checkout, /Library, Campus, Gaya/);
  // The old address remains in the saved-address list; only selection changes.
  assert.ok(!checkout.includes('Selected: Room 12, Campus, Patna'), 'Checkout must not retain the old selected address');
  session.dispose();
});

async function addressSession() {
  const repository = await createRepositories({ authMode: 'mock', platform: 'web', demoUid: 'customer-a' });
  const session = service.createCustomerAccountSession('customer-a', () => 'customer-a', async () => ({ repository, getUid: () => 'customer-a' }));
  session.start(); await setImmediate();
  await session.saveAddress('home', address);
  return { session, repository };
}

for (const origin of ['this view', 'another address view']) {
  test(`edit -> delete from ${origin} -> old Save callback cannot recreate the address`, async () => {
    const { session, repository } = await addressSession();
    const props = { editingId: 'home', formId: 'unused', initialDraft: address, onClose() {} };
    const methods = { saveAddress: session.saveAddress };
    render(SavedAddressEditor, session.getSnapshot(), props, methods);
    const oldSave = buttons.find(button => button.accessibilityLabel === 'Save address');
    assert.ok(oldSave);
    // Model the confirmed deletion through the actual repository-backed session.
    // SSR does not simulate React state/effect scheduling or confirmation clicks.
    if (origin === 'this view') await session.removeAddress('home');
    else { await repository.addresses.remove('home'); await session.retry(); }
    const invalidated = render(SavedAddressEditor, session.getSnapshot(), props, methods);
    assert.match(invalidated, /deleted or is no longer available/);
    assert.ok(!buttons.some(button => button.accessibilityLabel === 'Save address'));
    oldSave.onPress(); await setImmediate();
    assert.deepEqual(await repository.addresses.list(), []);
    session.dispose();
  });
}

test('address editor still adds and edits using the intended document IDs', async () => {
  const { session, repository } = await addressSession();
  const methods = { saveAddress: session.saveAddress };
  let closes = 0;
  render(SavedAddressEditor, session.getSnapshot(), { editingId: null, formId: 'added', initialDraft: { ...address, addressLine: 'Added room' }, onClose: () => { closes++; } }, methods);
  buttons.find(button => button.accessibilityLabel === 'Save address').onPress(); await setImmediate();
  assert.equal(closes, 1);
  render(SavedAddressEditor, session.getSnapshot(), { editingId: 'added', formId: 'unused', initialDraft: { ...address, addressLine: 'Edited room' }, onClose: () => { closes++; } }, methods);
  buttons.find(button => button.accessibilityLabel === 'Save address').onPress(); await setImmediate();
  const saved = await repository.addresses.list();
  assert.equal(saved.length, 2);
  assert.equal(saved.find(address => address.id === 'added').data.addressLine, 'Edited room');
  assert.equal(closes, 2);
  session.dispose();
});

test('transient loading does not identify an edit as deleted; a lost selection shows a reselection notice', async () => {
  const { session } = await addressSession();
  const props = { editingId: 'home', formId: 'unused', initialDraft: address, onClose() {} };
  const html = render(SavedAddressEditor, { ...session.getSnapshot(), loading: true, addresses: [] }, props);
  assert.doesNotMatch(html, /deleted or is no longer available/);
  assert.equal(buttons.find(button => button.accessibilityLabel === 'Save address').disabled, true);
  await session.removeAddress('home');
  const empty = render(SavedAddresses, session.getSnapshot());
  assert.match(empty, /Your selected address is no longer available/);
  session.dispose();
});
