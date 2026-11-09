import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const babel = require('@babel/core');
const root = path.resolve(import.meta.dirname, '..');
let app;
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
    if (id === 'react-native') return require('react-native-web');
    if (id === 'react-native-safe-area-context') return { SafeAreaView: require('react-native-web').View };
    if (id === 'expo-status-bar') return { StatusBar: () => null };
    if (id === '@expo/vector-icons') return { Ionicons: () => null };
    if (id === '../context/AppContext') return { useApp: () => app };
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
const fixture = { product: { id: 'fixture', name: 'Synthetic checkout fixture', price: 120, image: '' }, quantity: 2 };
function render(overrides = {}) {
  app = {
    cart: [], cartSubtotal: 0, deliveryFee: 0, appliedDiscount: 0,
    appliedCoupon: null, finalTotal: 0, fulfillment: 'delivery', deliveryAddressDraft: '',
    updateQuantity() {}, applyCoupon() {}, removeCoupon() {},
    setFulfillment() {}, setDeliveryAddressDraft() {}, ...overrides,
  };
  return renderToStaticMarkup(React.createElement(CheckoutScreen));
}

test('empty checkout renders no seeded items and disables review', () => {
  const html = render();
  assert.match(html, /Your cart is empty/);
  assert.match(html, /aria-disabled="true"/);
  assert.doesNotMatch(html, /Paneer Butter Masala|Butter Naan|Masala Chaas/);
  assert.match(html, /No payment is collected/);
});

test('pickup renders shared cart and estimate without an address field', () => {
  const html = render({ cart: [fixture], cartSubtotal: 240, finalTotal: 240, fulfillment: 'pickup' });
  assert.match(html, /Synthetic checkout fixture/);
  assert.match(html, /₹240/);
  assert.doesNotMatch(html, /aria-label="Delivery address"/);
  assert.doesNotMatch(html, /aria-disabled="true"/);
  assert.doesNotMatch(html, /Payment Successful|paid successfully|Track Order/);
});

test('delivery exposes a cross-platform text input and requires a nonblank draft', () => {
  const values = { cart: [fixture], cartSubtotal: 240, deliveryFee: 35, finalTotal: 275 };
  const blank = render({ ...values, deliveryAddressDraft: '   ' });
  assert.match(blank, /aria-label="Delivery address"/);
  assert.match(blank, /aria-disabled="true"/);
  const entered = render({ ...values, deliveryAddressDraft: 'Synthetic delivery address' });
  assert.match(entered, /Synthetic delivery address/);
  assert.match(entered, /₹275/);
  assert.doesNotMatch(entered, /aria-disabled="true"/);
});
