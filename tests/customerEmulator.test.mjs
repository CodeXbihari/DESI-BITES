import test from 'node:test';
import assert from 'node:assert/strict';
import { deleteApp, getApps } from 'firebase/app';
import { getFirestore, terminate } from 'firebase/firestore';
import { getCustomerEmulator } from '../src/config/customerEmulator.web.ts';

async function mode(enabled, run) {
  const oldDev = globalThis.__DEV__, oldFlag = process.env.EXPO_PUBLIC_CUSTOMER_EMULATOR, oldLocation = globalThis.location;
  globalThis.__DEV__ = true;
  process.env.EXPO_PUBLIC_CUSTOMER_EMULATOR = enabled ? '1' : '0';
  try { await run(); }
  finally {
    if (oldDev === undefined) delete globalThis.__DEV__; else globalThis.__DEV__ = oldDev;
    if (oldFlag === undefined) delete process.env.EXPO_PUBLIC_CUSTOMER_EMULATOR; else process.env.EXPO_PUBLIC_CUSTOMER_EMULATOR = oldFlag;
    if (oldLocation === undefined) delete globalThis.location; else globalThis.location = oldLocation;
  }
}
test('customer bootstrap fails closed without explicit development emulator mode', async () => mode(false, async () => {
  const count = getApps().length; assert.throws(() => getCustomerEmulator(), /Explicit development emulator mode/);
  process.env.EXPO_PUBLIC_CUSTOMER_EMULATOR = '1'; globalThis.__DEV__ = false;
  assert.throws(() => getCustomerEmulator(), /Explicit development emulator mode/); assert.equal(getApps().length, count);
}));
test('customer bootstrap refuses a non-loopback browser before initialization', async () => mode(true, async () => {
  globalThis.location = { hostname: 'example.com' };
  assert.throws(() => getCustomerEmulator(), /loopback browser URL/);
  assert.equal(getApps().length, 0);
}));
test('real SDK bootstrap shares one isolated demo identity and disables live phone verification', async () => mode(true, async () => {
  const first = getCustomerEmulator(), second = getCustomerEmulator();
  try {
    assert.equal(first, second); assert.equal(first.app.options.projectId, 'demo-desiibites-stage1');
    assert.equal(first.auth.app, first.app); assert.equal(first.repository.kind, 'emulator');
    assert.equal(first.auth.emulatorConfig.host, '127.0.0.1'); assert.equal(first.auth.emulatorConfig.port, 9099);
    assert.equal(first.auth.settings.appVerificationDisabledForTesting, true);
    assert.equal(first.auth.currentUser, null);
  } finally { await terminate(getFirestore(first.app)); await deleteApp(first.app); }
}));
