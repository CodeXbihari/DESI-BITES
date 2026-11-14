import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessAdmin, canRequestAdminOtp, DEVELOPMENT_ADMIN_PHONE } from '../src/features/admin/adminAccess.ts';

test('development Admin sign-in requests only the configured Firebase test phone', () => {
  assert.equal(canRequestAdminOtp(DEVELOPMENT_ADMIN_PHONE, true), true);
  assert.equal(canRequestAdminOtp('+919876543210', true), false);
});

test('a verified phone without a Firebase Admin claim never opens Admin screens', () => {
  assert.equal(canAccessAdmin(false, DEVELOPMENT_ADMIN_PHONE, true), false);
  assert.equal(canAccessAdmin(false, DEVELOPMENT_ADMIN_PHONE, false), false);
  assert.equal(canAccessAdmin(false, '+919876543210', false), false);
});

test('development Admin access needs both the configured phone and Firebase claim', () => {
  assert.equal(canAccessAdmin(true, DEVELOPMENT_ADMIN_PHONE, true), true);
  assert.equal(canAccessAdmin(true, '+919876543210', true), false);
});

test('production Admin access depends on Firebase claim, not demo phone', () => {
  assert.equal(canAccessAdmin(true, '+919876543210', false), true);
});
