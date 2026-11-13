import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { requireNativeStage1, nativeStage1Target, assertNativeStage1Target } from '../../src/config/nativeStage1.ts';
import { assertMatchingProject } from '../../src/config/firebaseTarget.ts';
import { createRepositories } from '../../src/backend/createRepositories.ts';
import { requireStage1SeedEnvironment } from '../native/seedStage1.mjs';

const require = createRequire(import.meta.url);
const ready = { version: 1, ready: true, applicationId: 'com.desi.app.stage1', projectId: 'demo-desiibites-stage1',
  transport: 'usb', host: '127.0.0.1', authPort: 9099, firestorePort: 8080, authConnected: true, firestoreConnected: true };
// Evaluate the real bootstrap with a mocked module boundary, not a production
// loader/proof injection API. No actual RN bridge or SDK restoration is claimed.
function harness(runtime = ready, projectId = ready.projectId, failure = false) {
  const calls = [], auth = { currentUser: { uid: 'stage1-customer' }, emulatorConfig: null };
  const { code } = require('@babel/core').transformSync(readFileSync(new URL('../../src/backend/nativeStage1Bootstrap.ts', import.meta.url), 'utf8'), {
    filename: 'nativeStage1Bootstrap.ts', babelrc: false, configFile: false,
    presets: ['@babel/preset-typescript'], plugins: ['@babel/plugin-transform-modules-commonjs'],
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => {
    if (name.endsWith('nativeStage1.ts')) return { requireNativeStage1, nativeStage1Target, assertNativeStage1Target };
    if (name.endsWith('firebaseTarget.ts')) return { assertMatchingProject };
    if (name.endsWith('createRepositories.ts')) return { createRepositories };
    if (name === 'react-native') return { NativeModules: { DesiiStage1Runtime: runtime } };
    calls.push(name);
    if (name === '@react-native-firebase/app') return { getApp: () => ({ options: { projectId } }) };
    if (name === '@react-native-firebase/auth') return { getAuth: () => auth };
    if (name === '@react-native-firebase/firestore') return { getFirestore() { if (failure) throw new Error('Native Firestore unavailable'); return {}; } };
    if (name === './firestore/adapter') return { androidStorePort: () => ({ uid: () => auth.currentUser?.uid ?? null, get: async () => null, list: async () => [], transaction() { throw new Error('Not expected'); }, serverTimestamp() {} }) };
    throw new Error(`Unexpected bootstrap dependency: ${name}`);
  }, module, module.exports);
  return { bootstrap: module.exports.bootstrapNativeStage1, calls, auth };
}
test('invalid native readiness fails before loading Firebase, without mock fallback', async () => {
  const invalid = [undefined, null, [], {}, ...Object.entries({ version: 2, ready: false, applicationId: 'com.desi.app',
    projectId: 'desi-bytes-dbc89', transport: 'avd', host: '10.0.2.2', authPort: 9199, firestorePort: 8181,
    authConnected: false, firestoreConnected: false }).map(([k, v]) => ({ ...ready, [k]: v }))];
  for (const value of invalid) {
    const h = harness(value === undefined ? null : value);
    await assert.rejects(() => h.bootstrap()); assert.equal(h.calls.length, 0);
    await assert.rejects(() => h.bootstrap(ready, () => { throw new Error('Must not accept a loader'); }));
    assert.equal(h.calls.length, 0);
  }
});
test('native bootstrap preserves project guard and propagates setup failures', async () => {
  const wrong = harness(ready, 'desi-bytes-dbc89');
  await assert.rejects(() => wrong.bootstrap(), /project IDs/);
  assert.deepEqual(wrong.calls, ['@react-native-firebase/app']);
  const broken = harness(ready, ready.projectId, true);
  await assert.rejects(() => broken.bootstrap(), /Native Firestore unavailable/);
  await assert.rejects(() => broken.bootstrap(), /Native Firestore unavailable/);
  assert.equal(broken.calls.filter(x => x === '@react-native-firebase/app').length, 1);
  for (const host of ['10.0.2.2', 'example.com']) {
    const h = harness(); h.auth.emulatorConfig = { host, port: 9099 };
    await assert.rejects(() => h.bootstrap(), /target mismatch/);
  }
});
test('bootstrap-owned entry point caches native sessions and does not reconnect', async () => {
  const h = harness(), first = h.bootstrap(); assert.equal(h.bootstrap(), first);
  const r = await first;
  assert.equal(r.kind, 'emulator'); assert.equal(r.orders.create, undefined);
  assert.equal(await r.profile.get(), null);
  assert.equal(h.calls.filter(x => x === '@react-native-firebase/auth').length, 1);
  h.auth.currentUser = null; await assert.rejects(() => r.profile.get(), /authentication/);
  h.auth.currentUser = { uid: 'stage1-owner' }; assert.equal(await r.profile.get(), null);
  const input = { ...ready }; assert.ok(Object.isFrozen(requireNativeStage1(input)));
});
test('release mode rejects native Stage 1 readiness', () => {
  globalThis.__DEV__ = false;
  try { assert.throws(() => requireNativeStage1(ready), /release/); }
  finally { delete globalThis.__DEV__; }
});
test('build target metadata rejects mock/admin conflict and preserves normal configuration', () => {
  const config = require('../../app.config.js'), prior = { ...process.env };
  try {
    delete process.env.DESII_BUILD_TARGET;
    const normal = config({ config: { name: 'Existing', android: { package: 'com.desi.app' }, plugins: [] } });
    assert.equal(normal.name, 'Existing'); assert.equal(normal.android.package, 'com.desi.app');
    process.env.DESII_BUILD_TARGET = 'stage1'; process.env.EXPO_PUBLIC_AUTH_MODE = 'mock';
    assert.throws(() => config({ config: {} }), /mock/);
    process.env.EXPO_PUBLIC_AUTH_MODE = 'firebase'; process.env.EXPO_PUBLIC_ADMIN_PREVIEW = '0';
    const enabled = config({ config: { name: 'Existing', android: { package: 'com.desi.app' }, plugins: [] } });
    assert.deepEqual(enabled, normal); // All production defaults, not just name.
    process.env.DESII_BUILD_TARGET = 'production-typo'; assert.throws(() => config({ config: {} }), /Unknown/);
  } finally {
    for (const k of ['DESII_BUILD_TARGET', 'EXPO_PUBLIC_AUTH_MODE', 'EXPO_PUBLIC_ADMIN_PREVIEW']) {
      if (prior[k] === undefined) delete process.env[k]; else process.env[k] = prior[k];
    }
  }
});
test('native transformations are idempotent and fail on unknown insertion points', () => {
  const { transforms: t } = require('../../plugins/withStage1Android.cjs');
  const app = 'super.onCreate()\nPackageList(this).packages.apply {\n}\nloadReactNative(this)';
  const transformed = t.addApplication(app);
  assert.ok(transformed.indexOf('Stage1FirebaseBootstrap') < transformed.lastIndexOf('loadReactNative(this)'));
  assert.equal(t.addApplication(transformed), transformed);
  assert.throws(() => t.addApplication('unexpected template'), /Cannot safely locate/);
  assert.throws(() => t.addApplication(transformed.replace('.invoke(null, this)', '.invoke(null, null)')), /Conflicting|corrupted/);
  assert.throws(() => t.addApplication(transformed + '\n// Stage1RuntimePackage'), /Conflicting/);
  assert.throws(() => t.addApplication(transformed + transformed), /Conflicting|corrupted/);
  const activity = 'override fun getMainComponentName(): String = "main"';
  assert.match(t.addActivity(activity), /"DesiiBitesStage1" else "main"/);
  assert.equal(t.addActivity(t.addActivity(activity)), t.addActivity(activity));
  assert.throws(() => t.addActivity(t.addActivity(activity).replace('else "main"', 'else "other"')), /Conflicting|corrupted/);
  const gradle = t.addGradle('existing debug and release blocks');
  assert.equal(t.addGradle(gradle), gradle); assert.match(gradle, /googleServicesJsonFiles/);
  assert.throws(() => t.addGradle(gradle + gradle), /Unexpected|Conflicting/);
  assert.throws(() => t.addGradle(gradle.replace("applicationIdSuffix '.stage1'", "applicationIdSuffix '.wrong'")), /Unexpected/);
  assert.throws(() => t.addGradle('android { buildTypes { stage1 {} } }'), /Conflicting/);
  assert.match(gradle, /applicationIdSuffix '.stage1'/);
  assert.throws(() => t.validateSynthetic({}), /Invalid synthetic/);
  const synthetic = require('../../config/firebase/stage1.google-services.json');
  t.validateSynthetic(synthetic);
  assert.throws(() => t.validateSynthetic({ ...synthetic, project_info: { project_id: 'desi-bytes-dbc89' } }), /Invalid synthetic/);
  assert.throws(() => t.validateSynthetic({ ...synthetic, client: [{ client_info: { android_client_info: { package_name: 'com.desi.app' } } }] }), /Invalid synthetic/);
  for (const mutate of [
    d => { delete d.project_info.project_number; },
    d => { d.project_info.project_number = '999'; },
    d => { d.client[0].client_info.mobilesdk_app_id = 'not-an-app-id'; },
    d => { d.client[0].api_key[0].current_key = 'malformed'; },
    d => { d.client[0].api_key[0].current_key = 'AIzaSy111111111111111111111111111111111'; },
    d => { d.configuration_version = 1; },
    d => { d.client.push(d.client[0]); },
    d => { d.project_info.storage_bucket = 'unexpected-bucket'; },
    d => { d.client[0].oauth_client = []; },
  ]) {
    const bad = structuredClone(synthetic); mutate(bad); assert.throws(() => t.validateSynthetic(bad), /Invalid synthetic/);
  }
  assert.match(gradle, /requires the existing Google Services plugin/);
});
test('Stage 1 uses a distinct native root and never imports the customer App eagerly', () => {
  const entry = readFileSync(new URL('../../index.js', import.meta.url), 'utf8');
  assert.match(entry, /registerComponent\('DesiiBitesStage1'/);
  assert.doesNotMatch(entry, /import App from/);
  const harness = readFileSync(new URL('../../src/backend/Stage1VerificationApp.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(harness, /from ['"].*App['"]|AuthProvider|createDemoRepositories/);
});
test('synthetic seeder requires exact demo project and both loopback endpoints', () => {
  const env = { GCLOUD_PROJECT: ready.projectId, FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080' };
  requireStage1SeedEnvironment(env);
  for (const bad of [{}, { ...env, GCLOUD_PROJECT: 'desi-bytes-dbc89' }, { ...env, FIREBASE_AUTH_EMULATOR_HOST: '10.0.2.2:9099' }, { ...env, FIRESTORE_EMULATOR_HOST: undefined }, { ...env, GOOGLE_CLOUD_PROJECT: 'desi-bytes-dbc89' }]) assert.throws(() => requireStage1SeedEnvironment(bad));
});
test('synthetic seeder refuses colliding identities without account writes or Firestore setup', async () => {
  const { seedStage1 } = await import('../native/seedStage1.mjs');
  const original = globalThis.fetch; const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push(url); assert.equal(options.redirect, 'error');
    assert.ok(url.startsWith('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/projects/demo-desiibites-stage1/'));
    return { ok: true, json: async () => ({ users: [{ localId: 'stage1-customer', email: 'different@example.invalid' }] }) };
  };
  try {
    await assert.rejects(() => seedStage1({ GCLOUD_PROJECT: ready.projectId, FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080' }), /Conflicting synthetic identity/);
    assert.equal(requests.length, 1); assert.ok(requests[0].endsWith('accounts:lookup'));
  } finally { globalThis.fetch = original; }
});
