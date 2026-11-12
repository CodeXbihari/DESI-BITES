import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { searchMenu } from '../src/services/menuSearch.ts';
const menu = JSON.parse(readFileSync(new URL('../src/data/restaurantMenu.json', import.meta.url)));

test('menu entries have unique identities, positive exact prices and bundled dish photos', () => {
  assert.equal(new Set(menu.map(item => item.id)).size, menu.length);
  assert.equal(new Set(menu.map(item => item.name)).size, menu.length);
  for (const item of menu) {
    assert.ok(item.name && item.category && item.description);
    assert.ok(Number.isInteger(item.price) && item.price > 0);
    assert.equal(typeof item.available, 'boolean');
    assert.equal(typeof item.isVeg, 'boolean');
    assert.ok(existsSync(new URL('../' + item.image, import.meta.url)), item.image);
  }
  const prices = Object.fromEntries(menu.map(item => [item.name, item.price]));
  assert.equal(prices['Paneer Pizza'], 190);
  assert.equal(prices['Tomato Pizza'], 120);
  assert.equal(prices['Pineapple Pizza'], 160);
  assert.equal(prices['Paneer Roll'], 85);
  assert.equal(prices['Sattu Paratha'], 70);
});

test('Paneer search spans every matching category without unrelated products', () => {
  const result = searchMenu(menu, '  PaNeEr  ');
  const categories = new Set(result.map(item => item.category));
  for (const category of ['Pizza','Burgers','Pasta','Sandwiches','Rolls','Maggi','Paratha']) assert.ok(categories.has(category), category);
  assert.ok(result.every(item => item.name.toLowerCase().includes('paneer')));
});

test('food search supports partial names and does not match category or description alone', () => {
  assert.equal(searchMenu(menu, 'mAgGi').length, 8);
  assert.deepEqual(searchMenu(menu, 'musHroom pi'), menu.filter(item => item.name.toLowerCase().includes('mushroom pi')));
  for (const query of ['pizza','juice','burger']) {
    const results = searchMenu(menu, query);
    assert.ok(results.length > 0);
    assert.ok(results.every(item => item.name.toLowerCase().includes(query)));
  }
  assert.deepEqual(searchMenu(menu, 'Taste of Bihar'), []);
});

test('clearing a query and unmatched searches return no unrelated suggestions', () => {
  assert.deepEqual(searchMenu(menu, ''), []);
  assert.deepEqual(searchMenu(menu, '   '), []);
  assert.deepEqual(searchMenu(menu, 'no-such-dish-123'), []);
});
