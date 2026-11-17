import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { catalogMenuSeed, DEMO_MENU_SHOP, loadCustomerMenu } from '../src/services/customerMenu.ts';
import { createRepositories } from '../src/backend/createRepositories.ts';
import { searchMenu } from '../src/services/menuSearch.ts';

const catalog = JSON.parse(readFileSync(new URL('../src/data/restaurantMenu.json', import.meta.url)));
const sections = JSON.parse(readFileSync(new URL('../src/data/homeSections.json', import.meta.url)));
const seed = () => catalogMenuSeed(catalog);
const image = key => key;
const demo = () => createRepositories({ authMode: 'mock', platform: 'web', demoMenu: seed() }, () => { throw new Error('Firebase must not load'); });

test('all 122 catalog entries round-trip through the real menu repository API without field or ordering loss', async () => {
  const repository = await demo();
  const items = await loadCustomerMenu(repository, DEMO_MENU_SHOP, image);
  assert.equal(items.length, 122);
  assert.deepEqual(items, catalog);
  assert.equal((await repository.menu.categories(DEMO_MENU_SHOP)).length, 16);
  for (const ids of Object.values(sections)) assert.ok(ids.every(id => items.some(item => item.id === id)));
  assert.deepEqual(searchMenu(items, '  PaNeEr '), searchMenu(catalog, '  PaNeEr '));
  assert.deepEqual(searchMenu(items, ''), []);
  assert.deepEqual(searchMenu(items, 'no-such-dish'), []);
});

test('image keys are resolved at the presentation boundary and serving notes survive', async () => {
  const items = await loadCustomerMenu(await demo(), DEMO_MENU_SHOP, key => `resolved:${key}`);
  assert.deepEqual(items.map(item => item.image), catalog.map(item => `resolved:${item.image}`));
  assert.deepEqual(items.map(item => item.availabilityNote), catalog.map(item => item.availabilityNote));
});

test('demo seeds and returned data are isolated; unseeded factory remains empty', async () => {
  const input = seed();
  const repository = await createRepositories({ authMode: 'mock', platform: 'web', demoMenu: input });
  input.items[0].data.name = 'Changed outside store';
  const items = await repository.menu.list(DEMO_MENU_SHOP);
  items[0].data.pricePaise = 1;
  assert.deepEqual(await loadCustomerMenu(repository, DEMO_MENU_SHOP, image), catalog);
  assert.deepEqual(await loadCustomerMenu(await createRepositories({ authMode: 'mock', platform: 'web' }), DEMO_MENU_SHOP, image), []);
});

test('emulator repository responses drive prices/availability and are filtered by publication/active category', async () => {
  const input = seed();
  input.items[0].data.pricePaise = 15950;
  input.items[0].data.available = false;
  input.items[1].data.published = false;
  input.categories[1].data.isActive = false;
  const target = { mode: 'emulator', development: true, projectId: 'demo-desiibites-stage1', host: '127.0.0.1', authPort: 9099, firestorePort: 8080 };
  const requested = [];
  const returned = new Map();
  // Exercise the actual factory + shared repositories using an SDK-free adapter.
  const repository = await createRepositories({ authMode: 'firebase', platform: 'web', target }, async () => ({
    uid: () => 'synthetic-customer', get: async () => null,
    async list(path, query = {}) {
      requested.push(path);
      let rows = path.endsWith('/menuItems') ? input.items : input.categories;
      for (const [field, expected] of query.filters ?? []) rows = rows.filter(row => row.data[field] === expected);
      returned.set(path, rows);
      return rows;
    },
    transaction: async () => { throw new Error('Reads only'); }, serverTimestamp: () => ({}),
  }));
  const items = await loadCustomerMenu(repository, DEMO_MENU_SHOP, image);
  assert.equal(items[0].price, 159.5);
  assert.equal(items[0].available, false);
  assert.ok(!items.some(item => item.id === input.items[1].id));
  assert.ok(!items.some(item => item.category === input.categories[1].data.name));
  // Reproduce the real mismatch: the item query still returns published
  // items in an inactive category, but the category query omits that category.
  const inactiveId = input.categories[1].id;
  assert.ok(returned.get(`shops/${DEMO_MENU_SHOP}/menuItems`).some(item => item.data.categoryId === inactiveId));
  assert.ok(!returned.get(`shops/${DEMO_MENU_SHOP}/menuCategories`).some(category => category.id === inactiveId));
  assert.deepEqual(items.map(item => item.id), input.items.filter(item => item.data.published && item.data.categoryId !== inactiveId).map(item => item.id));
  assert.deepEqual(requested.sort(), [`shops/${DEMO_MENU_SHOP}/menuCategories`, `shops/${DEMO_MENU_SHOP}/menuItems`]);
});

test('empty results remain empty; repository failures propagate and a subsequent retry can recover', async () => {
  let failing = true;
  const backing = await demo();
  const repository = { kind: 'emulator', menu: { ...backing.menu, list: async shop => {
    if (failing) throw new Error('offline');
    return backing.menu.list(shop);
  } } };
  await assert.rejects(() => loadCustomerMenu(repository, DEMO_MENU_SHOP, image), /offline/);
  failing = false;
  assert.deepEqual(await loadCustomerMenu(repository, DEMO_MENU_SHOP, image), catalog);
  assert.deepEqual(await loadCustomerMenu(backing, 'missing-shop', image), []);
});

test('items outside the active category set are omitted without altering valid items', async () => {
  const input = seed();
  input.items[0].data.categoryId = 'missing-category';
  const repository = { kind: 'emulator', menu: { list: async () => input.items, categories: async () => input.categories } };
  assert.deepEqual(await loadCustomerMenu(repository, DEMO_MENU_SHOP, image), catalog.slice(1));
  repository.menu.categories = async () => [];
  assert.deepEqual(await loadCustomerMenu(repository, DEMO_MENU_SHOP, image), []);
});

test('category repository failures propagate even when menu items are valid', async () => {
  const repository = await demo();
  repository.menu.categories = async () => { throw new Error('category service offline'); };
  await assert.rejects(() => loadCustomerMenu(repository, DEMO_MENU_SHOP, image), /category service offline/);
});

test('malformed price and unknown image still fail instead of inventing menu information', async () => {
  for (const fault of ['price', 'image']) {
    const input = seed();
    if (fault === 'price') input.items[0].data.pricePaise = 12.5;
    const repository = { kind: 'emulator', menu: { list: async () => input.items, categories: async () => input.categories } };
    await assert.rejects(() => loadCustomerMenu(repository, DEMO_MENU_SHOP, fault === 'image' ? () => { throw new Error('Unknown image'); } : image));
  }
  assert.throws(() => catalogMenuSeed([{ ...catalog[0], hindiName: 'नाम' }]), /hindiName/);
});
