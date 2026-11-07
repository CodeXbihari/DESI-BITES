import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeIndianPhone, validateOtp, authErrorMessage } from '../src/services/authValidation.ts';

test('normalizes Indian national and international formats without accepting other countries', () => {
  assert.equal(normalizeIndianPhone('98765 43210'), '+919876543210');
  assert.equal(normalizeIndianPhone('+91 (98765) 43210'), '+919876543210');
  for (const phone of ['', '1234567890', '987654321', '98765432100', '+449876543210', '98765abc43210']) {
    assert.throws(() => normalizeIndianPhone(phone));
  }
});
test('only accepts a complete six-digit code and preserves leading zeros', () => {
  assert.doesNotThrow(() => validateOtp('012345'));
  for (const code of ['', '1234', '12345', '1234567', '123a56', ' 123456']) assert.throws(() => validateOtp(code));
});
test('maps Firebase errors to safe actionable messages', () => {
  assert.match(authErrorMessage({ code: 'auth/invalid-verification-code' }), /incorrect/);
  assert.match(authErrorMessage({ code: 'auth/network-request-failed' }), /internet/);
  assert.equal(authErrorMessage({ code: 'auth/unknown', message: 'sensitive internal detail' }), 'Authentication failed. Please try again.');
});
