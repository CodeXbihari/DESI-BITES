import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isMockAuthEnabled } from '../src/services/authMode.ts';

test('development mock mode is enabled on Web, Android and iOS', () => {
  assert.equal(isMockAuthEnabled('web', 'mock', true), true);
  assert.equal(isMockAuthEnabled('android', 'mock', true), true);
  assert.equal(isMockAuthEnabled('ios', 'mock', true), true);
});

test('Firebase auth remains selected when mock mode is disabled or not in development', () => {
  assert.equal(isMockAuthEnabled('web', undefined, true), false);
  assert.equal(isMockAuthEnabled('android', 'firebase', true), false);
  assert.equal(isMockAuthEnabled('android', 'mock', false), false);
});
