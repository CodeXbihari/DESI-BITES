import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { createWebAdapter } from '../backend/firestore/adapter.web.ts';
import { buildRepositories } from '../backend/firestore/repositories.ts';
import { customerEmulatorEnabled, CUSTOMER_EMULATOR_TARGET } from './customerEmulator.ts';
export { customerEmulatorEnabled, CUSTOMER_EMULATOR_TARGET } from './customerEmulator.ts';

let instance: ReturnType<typeof initialize> | undefined;
function initialize() {
  const target = CUSTOMER_EMULATOR_TARGET;
  const name = 'desi-customer-emulator';
  const app = getApps().find(app => app.name === name) ?? initializeApp({ projectId: target.projectId,
    apiKey: 'emulator-only', appId: 'emulator-only', authDomain: 'localhost' }, name);
  // Initializes emulator Auth/Firestore before any observer or request.
  const port = createWebAdapter(app, target);
  // Phone sign-in must never request Google's production reCAPTCHA in this mode.
  getAuth(app).settings.appVerificationDisabledForTesting = true;
  const functions = getFunctions(app, 'us-central1');
  connectFunctionsEmulator(functions, target.host, 5001);
  return { app, auth: getAuth(app), functions, repository: buildRepositories(port) };
}
export function getCustomerEmulator() {
  if (!customerEmulatorEnabled()) throw new Error('Explicit development emulator mode is required.');
  if (typeof location !== 'undefined' && !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) throw new Error('Customer emulator preview requires a loopback browser URL.');
  return instance ??= initialize();
}
