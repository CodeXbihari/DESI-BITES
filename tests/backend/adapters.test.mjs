import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { requireEmulatorTarget, assertMatchingProject } from '../../src/config/firebaseTarget.ts';

const require = createRequire(import.meta.url), babel = require('@babel/core');
const target = { mode: 'emulator', development: true, projectId: 'demo-desiibites-stage1', host: '127.0.0.1', authPort: 9099, firestorePort: 8080 };

// Exercise both actual adapter modules against a narrow SDK boundary. This
// proves call order and session wiring, NOT a working Android native bridge.
function harness(platform, runtime) {
  const calls = [], auth = { currentUser: null, emulatorConfig: null };
  const sdk = {
    getAuth(app) { calls.push(['getAuth', app]); return auth; },
    connectAuthEmulator(_auth, url) {
      calls.push(['authEmulator', url]); const u = new URL(url);
      const host = platform === 'android' && ['localhost', '127.0.0.1'].includes(u.hostname) ? '10.0.2.2' : u.hostname;
      auth.emulatorConfig = { host, port: Number(u.port) };
    },
    initializeFirestore(app, settings) { calls.push(['initialize', app, settings]); return { app }; },
    connectFirestoreEmulator(_db, host, port) { calls.push(['firestoreEmulator', host, port]); },
    memoryLocalCache: () => 'memory',
    doc: (_db, ...segments) => segments.join('/'),
    getDocFromServer: async ref => { calls.push(['read', ref]); return { exists: () => true, data: () => ({ fixture: true }) }; },
    serverTimestamp: () => 'serverTimestamp',
    where: (field, op, value) => ({ field, op, value }),
    orderBy: (field, direction) => ({ order: field, direction }),
    documentId: () => '__name__', collection: (_db, path) => path,
    limit: n => ({ limit: n }), startAfter: cursor => ({ cursor }),
    query: (path, ...clauses) => ({ path, clauses }),
    getDocsFromServer: async q => { calls.push(['query', q]); return { docs: [] }; },
  };
  const name = platform === 'web' ? 'adapter.web.ts' : 'adapter.ts';
  const filename = new URL(`../../src/backend/firestore/${name}`, import.meta.url);
  const { code } = babel.transformSync(readFileSync(filename, 'utf8'), {
    filename: filename.pathname, babelrc: false, configFile: false,
    presets: ['@babel/preset-typescript'], plugins: ['@babel/plugin-transform-modules-commonjs'],
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => {
    if (name.endsWith('firebaseTarget.ts')) return { requireEmulatorTarget, assertMatchingProject };
    if (name === 'react-native') return { NativeModules: { DesiiStage1Runtime: runtime } };
    if (['firebase/auth', 'firebase/firestore', '@react-native-firebase/auth', '@react-native-firebase/firestore'].includes(name)) return sdk;
    throw new Error(`Unexpected SDK dependency: ${name}`);
  }, module, module.exports);
  return { calls, auth, create: module.exports[platform === 'web' ? 'createWebAdapter' : 'createAndroidAdapter'] };
}

for (const platform of ['web', 'android']) {
  test(`${platform}: actual adapter configures both emulators before operations and reuses the Auth session`, async () => {
    const h = harness(platform), app = { options: { projectId: target.projectId } };
    const port = h.create(app, target);
    assert.equal(port.uid(), null);
    h.auth.currentUser = { uid: 'customer-a' }; assert.equal(port.uid(), 'customer-a');
    h.auth.currentUser = { uid: 'customer-b' }; assert.equal(port.uid(), 'customer-b');
    assert.deepEqual(await port.get('users/customer-b'), { fixture: true });
    const events = h.calls.map(x => x[0]);
    assert.ok(events.indexOf('authEmulator') < events.indexOf('read'));
    assert.ok(events.indexOf('firestoreEmulator') < events.indexOf('read'));
    assert.equal(h.calls.find(x => x[0] === 'initialize')[2][platform === 'web' ? 'localCache' : 'persistence'], platform === 'web' ? 'memory' : false);
    assert.equal(h.create(app, target), port);
    assert.throws(() => h.create(app, { ...target, firestorePort: 8181 }), /retarget/);
    await port.list('orders', { filters: [['customerUid', 'customer-b']], order: ['createdAt', 'desc'], limit: 5 });
    const q = h.calls.at(-1)[1]; assert.equal(q.path, 'orders');
    assert.ok(q.clauses.some(c => c.field === 'customerUid' && c.value === 'customer-b'));
  });
  test(`${platform}: missing target/project mismatch fails before SDK initialization; production sessions cannot be reused`, () => {
    const h = harness(platform);
    assert.throws(() => h.create({ options: { projectId: target.projectId } }, undefined));
    assert.throws(() => h.create({ options: { projectId: 'other' } }, target));
    assert.equal(h.calls.length, 0);
    h.auth.currentUser = { uid: 'production-user' };
    assert.throws(() => h.create({ options: { projectId: target.projectId } }, target), /isolated/);
    assert.equal(h.calls.filter(x => x[0] === 'initialize').length, 0);
  });
}
test('android: preconfigured RN Firebase remapped Auth accepts equivalent host aliases', () => {
  for (const host of ['localhost', '127.0.0.1', '10.0.2.2']) {
    const h = harness('android'), app = { options: { projectId: target.projectId } };
    h.auth.emulatorConfig = { host: '10.0.2.2', port: target.authPort };
    h.auth.currentUser = { uid: 'emulator-owner' };
    const port = h.create(app, { ...target, host });
    assert.equal(port.uid(), 'emulator-owner');
    assert.equal(h.calls.filter(x => x[0] === 'authEmulator').length, 0);
    for (const alias of ['localhost', '127.0.0.1', '10.0.2.2']) assert.equal(h.create(app, { ...target, host: alias }), port);
    // Compare aliases only; let the existing SDK decide endpoint routing.
    assert.deepEqual(h.calls.find(x => x[0] === 'firestoreEmulator').slice(1), [host, target.firestorePort]);
  }
});
test('android: host alias matching still rejects unsafe hosts, different projects and ports', () => {
  for (const host of ['example.com', '127.0.0.1.evil', 'https://localhost', '10.0.2.3']) {
    const h = harness('android');
    assert.throws(() => h.create({ options: { projectId: target.projectId } }, { ...target, host }));
    assert.equal(h.calls.length, 0);
  }
  for (const config of [{ host: 'example.com', port: 9099 }, { host: '10.0.2.2', port: 9199 }]) {
    const h = harness('android'); h.auth.emulatorConfig = config;
    assert.throws(() => h.create({ options: { projectId: target.projectId } }, target), /target mismatch/);
    assert.equal(h.calls.filter(x => x[0] === 'initialize').length, 0);
  }
  const h = harness('android');
  assert.throws(() => h.create({ options: { projectId: 'other' } }, target), /project IDs/);
});
test('web: Android-only aliases are not accepted as equivalent Auth endpoints', () => {
  const h = harness('web'); h.auth.emulatorConfig = { host: '10.0.2.2', port: target.authPort };
  assert.throws(() => h.create({ options: { projectId: target.projectId } }, target), /target mismatch/);
});
test('release builds reject Emulator targets before loading Firebase', () => {
  globalThis.__DEV__ = false;
  try { assert.throws(() => requireEmulatorTarget(target, 'web'), /release/); }
  finally { delete globalThis.__DEV__; }
});

const nativeReady = { version: 1, ready: true, applicationId: 'com.desi.app.stage1',
  projectId: target.projectId, transport: 'usb', host: '127.0.0.1', authPort: 9099,
  firestorePort: 8080, authConnected: true, firestoreConnected: true };
test('ordinary Android adapter refuses the native Stage 1 app before SDK initialization', () => {
  for (const runtime of [nativeReady, {}, { ...nativeReady, ready: false }]) {
    const h = harness('android', runtime);
    assert.throws(() => h.create({ options: { projectId: target.projectId } }, target), /bootstrap entry point/);
    assert.equal(h.calls.length, 0);
  }
});
test('a generic proof argument cannot bypass ordinary adapter session checks', () => {
  const h = harness('android'); h.auth.currentUser = { uid: 'existing-user' };
  assert.throws(() => h.create({ options: { projectId: target.projectId } }, target, nativeReady), /isolated/);
  assert.equal(h.calls.filter(x => x[0] === 'initialize').length, 0);
});
