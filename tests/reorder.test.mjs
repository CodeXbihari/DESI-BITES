import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url), babel = require('@babel/core');
const root = path.resolve(import.meta.dirname, '..');
const native = require('react-native-web'), cache = new Map();
let app, menu, buttons, history;

// Same server-rendering approach as checkout.test.mjs. Render the real Reorder,
// status component and cart adapter; stub context inputs and platform assets.
// Captured callbacks verify wiring/handler guards, not browser click dispatch.
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
    if (id === 'react-native') return { ...native, TouchableOpacity: props => {
      buttons.push(props);
      return React.createElement(native.TouchableOpacity, props);
    } };
    if (id === '@expo/vector-icons') return { Ionicons: () => null };
    if (id === 'expo-asset') return { Asset: { fromModule: () => ({ uri: 'unused-static-asset' }) } };
    if (id === './menuImages') return { MENU_IMAGES: {} };
    if (id === '../context/AppContext') return { useApp: () => app };
    if (id === '../context/CustomerOrdersContext') return { useCustomerOrders: () => history };
    if (id === '../context/CustomerMenuContext') return { useCustomerMenu: () => menu };
    if (id === '../data/searchMenuData') return load(path.join(root, 'src/data/restaurantMenu.ts'));
    if (id.startsWith('.')) {
      const target = path.resolve(path.dirname(file), id);
      if (target.endsWith('.json')) return JSON.parse(fs.readFileSync(target, 'utf8'));
      for (const ext of ['.ts', '.tsx']) if (fs.existsSync(target + ext)) return load(target + ext);
    }
    return require(id);
  };
  new Function('require', 'module', 'exports', code)(localRequire, module, module.exports);
  return module.exports;
}
const { ReorderScreen } = load(path.join(root, 'src/screens/ReorderScreen.tsx'));
const current = { id: 'fixture', name: 'Current dish', price: 150, image: 'current.jpg', category: 'Pizza', description: '', availabilityNote: '', isVeg: true, available: true };
const order = { id: 'fixture-order', data: { createdAt: { seconds: 0, nanoseconds: 0 }, items: [
  { menuItemId: 'fixture', nameSnapshot: 'Old dish', unitPricePaise: 12000, quantity: 2 },
  { menuItemId: 'unavailable', nameSnapshot: 'Unavailable dish', quantity: 1 },
  { menuItemId: 'missing', nameSnapshot: 'Missing dish', quantity: 1 },
] } };
function render(overrides = {}, orders = [order]) {
  const added = [], opened = [];
  let retries = 0;
  buttons = [];
  app = { addCurrentMenuItems: items => { for (const item of items) for (let n = 0; n < item.quantity; n++) added.push(item.product); }, setIsCartOpen: value => opened.push(value) };
  history = { orders, loading: false, error: null, enabled: true, history() {} };
  menu = { items: [current], loading: false, error: null, source: 'demo', retry: () => { retries++; }, ...overrides };
  const html = renderToStaticMarkup(React.createElement(ReorderScreen));
  return { html, added, opened, get retries() { return retries; }, reorder: buttons.find(button => button.accessibilityLabel === 'Add dishes from order fixture-order to cart') };
}

test('Reorder renders loading and blocks even directly invoked actions with stale menu items', () => {
  const result = render({ loading: true });
  assert.match(result.html, /Loading menu/);
  assert.match(result.html, /aria-disabled="true"/);
  assert.doesNotMatch(result.html, /Unavailable now:/);
  result.reorder.onPress();
  assert.deepEqual(result.added, []);
  assert.deepEqual(result.opened, []);
});

test('Reorder renders repository errors and status retry calls the supplied context retry', () => {
  const result = render({ error: 'Menu service offline' });
  assert.match(result.html, /Menu service offline/);
  assert.match(result.html, /Retry menu/);
  assert.doesNotMatch(result.html, /Unavailable now:/);
  assert.equal(result.reorder.disabled, true);
  result.reorder.onPress();
  assert.deepEqual(result.added, []);
  buttons.find(button => button.children?.props?.children === 'Retry menu').onPress();
  assert.equal(result.retries, 1);
});

test('Reorder distinguishes a successfully empty menu from empty order history', () => {
  const noMenu = render({ items: [] });
  assert.match(noMenu.html, /No menu items are available/);
  assert.doesNotMatch(noMenu.html, /No past orders yet/);
  assert.equal(noMenu.reorder.disabled, true);
  noMenu.reorder.onPress();
  assert.deepEqual(noMenu.added, []);
  const noHistory = render({}, []);
  assert.match(noHistory.html, /No past orders yet/);
  assert.doesNotMatch(noHistory.html, /No menu items are available/);
  assert.equal(noHistory.reorder, undefined);
});

test('successful Reorder adds available items using current prices/quantities and skips missing or unavailable dishes', () => {
  const result = render({ items: [current, { ...current, id: 'unavailable', available: false }] });
  assert.equal(result.reorder.disabled, false);
  result.reorder.onPress();
  assert.equal(result.added.length, 2);
  assert.ok(result.added.every(product => product.id === current.id && product.price === 150 && product.image === 'current.jpg'));
  assert.deepEqual(result.opened, [true]);
});
