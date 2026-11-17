import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as accountService from '../src/services/customerAccount.ts';

const require = createRequire(import.meta.url);
const babel = require('@babel/core');
const root = path.resolve(import.meta.dirname, '..');
let app, account, orders, buttons;
const cache = new Map();

// Render the real checkout through React Native Web without a browser, native
// build, Firebase, or writes. Only platform wrappers and the context input are stubbed.
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const { code } = babel.transformSync(fs.readFileSync(file, 'utf8'), {
    filename: file, babelrc: false, configFile: false,
    presets: ['@babel/preset-typescript'],
    plugins: ['@babel/plugin-transform-react-jsx', '@babel/plugin-transform-modules-commonjs'],
  });
  const localRequire = id => {
    if (id === 'react-native') { const native = require('react-native-web'); return { ...native, TouchableOpacity: props => { buttons.push(props); return React.createElement(native.TouchableOpacity, props); } }; }
    if (id === 'react-native-safe-area-context') return { SafeAreaView: require('react-native-web').View };
    if (id === 'expo-status-bar') return { StatusBar: () => null };
    if (id === '@expo/vector-icons') return { Ionicons: () => null };
    if (id === '../context/AppContext') return { useApp: () => app };
    if (id === '../context/CustomerOrdersContext') return { useCustomerOrders: () => orders };
    if (id === '../context/CustomerAccountContext') return { useCustomerAccount: () => account };
    if (id === '../context/AuthContext') return { useAuth: () => ({ user: { uid: 'customer-a', displayName: 'Customer' } }) };
    if (id === '../services/customerAccount') return accountService;
    if (id.startsWith('.')) {
      const target = path.resolve(path.dirname(file), id);
      for (const extension of ['.ts', '.tsx', '/index.ts']) {
        if (fs.existsSync(target + extension)) return load(target + extension);
      }
    }
    return require(id);
  };
  new Function('require', 'module', 'exports', code)(localRequire, module, module.exports);
  return module.exports;
}

const { CheckoutScreen } = load(path.join(root, 'src/screens/CheckoutScreen.tsx'));
const { OrdersScreen } = load(path.join(root, 'src/screens/OrdersScreen.tsx'));
const { CustomerOrderDetailsScreen } = load(path.join(root, 'src/screens/CustomerOrderDetailsScreen.tsx'));
const fixture = { product: { id: 'fixture', name: 'Synthetic checkout fixture', price: 120, image: '' }, quantity: 2 };
function render(overrides = {}, accountOverrides = {}, orderOverrides = {}) {
  buttons = [];
  orders = { enabled: true, restoring: false, phase: 'idle', attempt: null, success: null, updateDraft() {}, quote() {}, confirm() {}, ...orderOverrides };
  account = { uid: 'customer-a', source: 'demo', profile: null, addresses: [], selectedAddressId: null,
    loading: false, busy: false, error: null, retry() {}, saveAddress() {}, selectAddress() {}, ...accountOverrides };
  account.selectedAddress = accountService.selectedCustomerAddress(account);
  app = {
    cart: [], cartVersion: 1, cartSubtotal: 0, deliveryFee: 0, appliedDiscount: 0,
    appliedCoupon: null, finalTotal: 0, fulfillment: 'delivery', deliveryAddressDraft: '',
    updateQuantity() {}, applyCoupon() {}, removeCoupon() {},
    setFulfillment() {}, setDeliveryAddressDraft() {}, ...overrides,
  };
  app.deliveryAddressDraft = accountService.formatCustomerAddress(account.selectedAddress?.data ?? null);
  return renderToStaticMarkup(React.createElement(CheckoutScreen));
}
function reviewButton(html) {
  const button = html.match(/<[^>]+aria-label="Review checkout"[^>]*>/)?.[0];
  assert.ok(button, 'Checkout review button must be present before checking its state');
  return button;
}
const saved = { id: 'home', data: { label: 'Home', addressLine: 'Room 12', area: 'Campus', city: 'Patna', pincode: '800001', deliveryInstructions: '', createdAt: { seconds: 0, nanoseconds: 0 }, updatedAt: { seconds: 0, nanoseconds: 0 } } };

test('review button state assertions fail if the review button is missing', () => {
  for (const html of ['', '<div aria-disabled="true">Another action</div>']) {
    assert.throws(() => reviewButton(html), /Checkout review button must be present/);
  }
});

test('empty checkout renders no seeded items and disables review', () => {
  const html = render();
  assert.match(html, /Your cart is empty/);
  assert.match(reviewButton(html), /aria-disabled="true"/);
  assert.doesNotMatch(html, /Paneer Butter Masala|Butter Naan|Masala Chaas/);
  assert.match(html, /No payment is collected/);
});

test('pickup renders shared cart and estimate without an address field', () => {
  const html = render({ cart: [fixture], cartSubtotal: 240, finalTotal: 240, fulfillment: 'pickup' });
  assert.match(html, /Synthetic checkout fixture/);
  assert.match(html, /₹240/);
  assert.doesNotMatch(html, /aria-label="Delivery address"/);
  assert.doesNotMatch(reviewButton(html), /aria-disabled="true"/);
  assert.doesNotMatch(html, /Payment Successful|paid successfully|Track Order/);
});

test('delivery requires a valid selected saved address rather than an independent text draft', () => {
  const values = { cart: [fixture], cartSubtotal: 240, deliveryFee: 35, finalTotal: 275 };
  const blank = render({ ...values, deliveryAddressDraft: '   ' });
  assert.match(blank, /Select a valid saved delivery address/);
  assert.match(reviewButton(blank), /aria-disabled="true"/);
  const entered = render(values, { addresses: [saved], selectedAddressId: 'home' });
  assert.match(entered, /Room 12, Campus, Patna/);
  assert.match(entered, /₹275/);
  assert.doesNotMatch(reviewButton(entered), /aria-disabled="true"/);
});

test('loading, errors, mutations and malformed selected addresses block delivery but not pickup', () => {
  const values = { cart: [fixture], cartSubtotal: 240, finalTotal: 275 };
  for (const state of [{ loading: true }, { busy: true }, { error: 'Offline' }, { addresses: [{ ...saved, data: { ...saved.data, pincode: '000000' } }] }]) {
    const account = { addresses: [saved], selectedAddressId: 'home', ...state };
    assert.match(reviewButton(render(values, account)), /aria-disabled="true"/);
    const pickup = render({ ...values, fulfillment: 'pickup' }, account);
    assert.doesNotMatch(reviewButton(pickup), /aria-disabled="true"/);
    assert.doesNotMatch(pickup, /Delivery address \(required\)/);
  }
});
test('mock sessions cannot request a persistent order quote', () => {
  const html = render({ cart: [fixture], fulfillment: 'pickup' }, {}, { enabled: false, error: 'Demo sessions cannot place orders.' });
  assert.match(reviewButton(html), /aria-disabled="true"/); assert.match(html, /Demo sessions cannot place orders/);
});
test('checkout requests a trusted quote and displays its snapshots and totals for explicit confirmation', () => {
  let submitted;
  render({ cart: [fixture], fulfillment: 'pickup' }, {}, { quote: draft => { submitted = draft; } });
  const request = buttons.find(b => b.accessibilityLabel === 'Review checkout'); assert.ok(request); request.onPress();
  assert.deepEqual(submitted.input.items, [{ menuItemId: 'fixture', quantity: 2 }]);
  const quote = { quoteId: 'quote-a', items: [{ menuItemId: 'fixture', nameSnapshot: 'Server dish', quantity: 2, lineTotalPaise: 30000 }], fulfillment: 'pickup', addressSnapshot: null,
    subtotalPaise: 30000, discountPaise: 0, deliveryFeePaise: 0, totalPaise: 30000, expiresAt: { seconds: 9999999999 } };
  let confirmed = 0;
  const html = render({ cart: [fixture], fulfillment: 'pickup' }, {}, { phase: 'review', attempt: { quote, draft: submitted }, confirm: () => { confirmed++; } });
  assert.match(html, /Server dish/); assert.match(html, /Final trusted total: ₹300.00/); assert.match(html, /Payment will remain Unpaid/);
  const button = buttons.find(b => b.accessibilityLabel === 'Confirm unpaid order'); assert.ok(button); assert.equal(button.disabled, false); button.onPress(); assert.equal(confirmed, 1);
});
test('uncertain checkout offers same-submission retry and blocks requesting another quote', () => {
  const html = render({ cart: [fixture], fulfillment: 'pickup' }, {}, { phase: 'uncertain', checkoutError: 'Retry same submission.' });
  assert.match(reviewButton(html), /aria-disabled="true"/); assert.match(html, /Retry same submission/);
});
test('stored order history and confirmation render trusted totals with unpaid labels and details navigation', () => {
  const order = { id: 'stored-order', data: { createdAt: { seconds: 1000 }, status: 'placed', payment: { status: 'unpaid' }, fulfillment: 'pickup', addressSnapshot: null,
    totalPaise: 30000, items: [{ menuItemId: 'dish', quantity: 2, nameSnapshot: 'Stored dish', lineTotalPaise: 30000 }] } };
  buttons = []; let opened;
  orders = { enabled: true, loading: false, error: null, orders: [order], more: false, history() {}, detailId: order.id, detail: order, detailLoading: false, detailError: null, loadOrder() {} };
  const history = renderToStaticMarkup(React.createElement(OrdersScreen, { onOpenOrder: id => { opened = id; } }));
  assert.match(history, /Stored dish/); assert.match(history, /Payment: Unpaid/); assert.doesNotMatch(history, /Total Paid|In 14 mins/);
  buttons.find(button => button.children?.props?.children === 'View order details').onPress(); assert.equal(opened, order.id);
  const confirmation = renderToStaticMarkup(React.createElement(CustomerOrderDetailsScreen, { orderId: order.id, confirmation: true, onBack() {}, onHistory() {} }));
  assert.match(confirmation, /Order placed/); assert.match(confirmation, /Status: Placed/); assert.match(confirmation, /Payment status: Unpaid/);
  assert.match(confirmation, /No payment has been collected/); assert.match(confirmation, /300.00/);
});
test('history distinguishes loading, error, empty and pagination states', () => {
  for (const [state, expected] of [[{ loading: true }, /Loading orders/], [{ error: 'History unavailable' }, /History unavailable/], [{}, /No orders yet/], [{ more: true }, /Load more orders/]]) {
    buttons = []; orders = { enabled: true, loading: false, error: null, orders: [], more: false, history() {}, ...state };
    assert.match(renderToStaticMarkup(React.createElement(OrdersScreen)), expected);
  }
});
