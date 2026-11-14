import { readFileSync } from 'node:fs';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, signInAnonymously, signOut } from 'firebase/auth';
import { doc, getFirestore, setDoc, terminate } from 'firebase/firestore';
import { createWebAdapter } from '../../src/backend/firestore/adapter.web.ts';
import { createRepositories } from '../../src/backend/createRepositories.ts';
import { fixtureDocuments } from './fixtures.mjs';

export const projectId = 'demo-desiibites-stage1';
export const target = Object.freeze({ mode: 'emulator', development: true, projectId, host: '127.0.0.1', authPort: 9099, firestorePort: 8080 });

export function requireLocalEmulators() {
  if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080'
    || process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099'
    || (process.env.GCLOUD_PROJECT && process.env.GCLOUD_PROJECT !== projectId)) {
    throw new Error('Tests require both loopback Emulators and the synthetic demo project. No cloud fallback.');
  }
}
export async function environment() {
  requireLocalEmulators();
  return initializeTestEnvironment({ projectId, firestore: { host: target.host, port: target.firestorePort, rules: readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8') } });
}
export async function seed(env, extra = []) {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async context => {
    for (const [path, data] of [...fixtureDocuments(), ...extra]) await setDoc(doc(context.firestore(), path), data);
  });
}
let next = 0;
export async function webClient() {
  requireLocalEmulators();
  // Deliberately synthetic app configuration; no .env or native config is read.
  const app = initializeApp({ projectId, apiKey: 'emulator-only', appId: 'emulator-only' }, `stage1-${++next}`);
  const adapter = createWebAdapter(app, target), auth = getAuth(app);
  await signInAnonymously(auth);
  const repositories = await createRepositories({ authMode: 'firebase', platform: 'web', target }, async () => adapter);
  return {
    app, auth, adapter, repositories, db: getFirestore(app),
    async close() { await signOut(auth); await terminate(getFirestore(app)); await deleteApp(app); },
  };
}
