import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deleteApp, getApps } from 'firebase/app';
import { getWebAuth } from '../src/config/firebase.web.ts';

const keys = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

test('rejects incomplete web configuration before initializing Firebase', () => {
  const original = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  try {
    delete process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
    assert.throws(() => getWebAuth(), /configuration is missing/);
    assert.equal(getApps().length, 0);
  } finally {
    if (original !== undefined) process.env.EXPO_PUBLIC_FIREBASE_API_KEY = original;
  }
});

test('initializes the configured web project once without sending SMS', {
  skip: keys.some(key => !process.env[key]),
}, async () => {
  const first = getWebAuth();
  const second = getWebAuth();
  assert.equal(first, second);
  assert.equal(getApps().length, 1);
  assert.equal(first.app.options.projectId, process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);
  assert.equal(first.app.options.appId, process.env.EXPO_PUBLIC_FIREBASE_APP_ID);
  assert.equal(first.currentUser, null);
  await deleteApp(first.app);
});
