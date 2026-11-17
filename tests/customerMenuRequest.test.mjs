import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { readFileSync } from 'node:fs';
import { startCustomerMenuRequest } from '../src/services/customerMenuRequest.ts';
import { catalogMenuSeed, DEMO_MENU_SHOP, loadCustomerMenu } from '../src/services/customerMenu.ts';
import { createRepositories } from '../src/backend/createRepositories.ts';

// No React mounting renderer/DOM is installed. These exercise the real request
// lifecycle used by the provider's effect, including its actual cleanup function.
// They do not claim React mounting, dependency scheduling or button interaction.
const catalog = JSON.parse(readFileSync(new URL('../src/data/restaurantMenu.json', import.meta.url)));
const seed = catalogMenuSeed(catalog);
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function begin(repository, shopId, publish) {
  return startCustomerMenuRequest(async () => ({
    items: await loadCustomerMenu(repository, shopId, key => key), source: repository.kind,
  }), repository.kind, publish);
}
function delayedRepository(pending, calls = []) {
  return { kind: 'emulator', menu: {
    list(shopId) { calls.push(['items', shopId]); return pending[shopId].promise; },
    categories: async shopId => { calls.push(['categories', shopId]); return seed.categories; },
  } };
}

test('provider request lifecycle publishes initial loading then repository data to its consumer', async () => {
  const repository = await createRepositories({ authMode: 'mock', platform: 'web', demoMenu: seed });
  const states = [];
  const cleanup = begin(repository, DEMO_MENU_SHOP, state => states.push(state));
  assert.deepEqual(states, [{ items: [], loading: true, error: null, source: 'demo' }]);
  await setImmediate();
  assert.deepEqual(states[1], { items: catalog, loading: false, error: null, source: 'demo' });
  assert.equal(states.length, 2);
  cleanup();
});

test('provider request lifecycle exposes failure and recovers through a new retry request', async () => {
  const request = deferred(), states = [], calls = [];
  const pending = { [DEMO_MENU_SHOP]: request };
  const repository = delayedRepository(pending, calls);
  const cleanup = begin(repository, DEMO_MENU_SHOP, state => states.push(state));
  await setImmediate();
  request.reject(new Error('offline'));
  await setImmediate();
  assert.equal(states.at(-1).loading, false);
  assert.equal(states.at(-1).error, 'Menu could not be loaded. Please retry.');
  assert.deepEqual(states.at(-1).items, []);
  cleanup(); // React cleans up the prior effect before the retry effect.
  pending[DEMO_MENU_SHOP] = deferred();
  const cleanupRetry = begin(repository, DEMO_MENU_SHOP, state => states.push(state));
  assert.deepEqual(states.at(-1), { items: [], loading: true, error: null, source: 'emulator' });
  await setImmediate();
  pending[DEMO_MENU_SHOP].resolve(seed.items);
  await setImmediate();
  assert.deepEqual(states.at(-1).items, catalog);
  assert.equal(states.at(-1).error, null);
  assert.equal(calls.filter(([kind]) => kind === 'items').length, 2);
  cleanupRetry();
});

for (const outcome of ['success', 'error']) {
  test(`provider cleanup suppresses ${outcome} after unmount`, async () => {
    const request = deferred(), states = [];
    const cleanup = begin(delayedRepository({ old: request }), 'old', state => states.push(state));
    await setImmediate();
    cleanup();
    if (outcome === 'success') request.resolve(seed.items);
    else request.reject(new Error('late failure'));
    await setImmediate();
    assert.equal(states.length, 1, 'unmounted consumer must receive no further state');
  });
}

for (const outcome of ['success', 'error']) {
  test(`shop change: old ${outcome} cannot overwrite a newer completed menu`, async () => {
    const old = deferred(), fresh = deferred(), states = [], calls = [];
    const repository = delayedRepository({ old, fresh }, calls);
    const cleanupOld = begin(repository, 'old', state => states.push(state));
    await setImmediate();
    cleanupOld();
    const cleanupFresh = begin(repository, 'fresh', state => states.push(state));
    await setImmediate();
    fresh.resolve([seed.items[1]]);
    await setImmediate();
    const settled = states.at(-1);
    assert.deepEqual(settled.items, [catalog[1]]);
    if (outcome === 'success') old.resolve([seed.items[0]]);
    else old.reject(new Error('old shop failure'));
    await setImmediate();
    assert.equal(states.at(-1), settled);
    assert.deepEqual(calls.filter(([kind]) => kind === 'items'), [['items', 'old'], ['items', 'fresh']]);
    cleanupFresh();
  });
}

test('repository replacement clears prior data and suppresses the replaced repository response', async () => {
  const old = deferred(), fresh = deferred(), states = [];
  const cleanupOld = begin(delayedRepository({ shop: old }), 'shop', state => states.push(state));
  await setImmediate();
  cleanupOld();
  const replacement = delayedRepository({ shop: fresh });
  replacement.kind = 'demo';
  const cleanupFresh = begin(replacement, 'shop', state => states.push(state));
  assert.deepEqual(states.at(-1), { items: [], loading: true, error: null, source: 'demo' });
  await setImmediate();
  old.resolve([seed.items[0]]);
  await setImmediate();
  assert.equal(states.at(-1).loading, true);
  fresh.resolve([seed.items[2]]);
  await setImmediate();
  assert.deepEqual(states.at(-1).items, [catalog[2]]);
  assert.equal(states.at(-1).source, 'demo');
  cleanupFresh();
});

test('synchronous loader failures are published as errors and cleanup is idempotent', async () => {
  const states = [];
  const cleanup = startCustomerMenuRequest(() => { throw new Error('setup failed'); }, 'demo', state => states.push(state));
  await setImmediate();
  assert.equal(states.at(-1).loading, false);
  assert.ok(states.at(-1).error);
  cleanup(); cleanup();
});
