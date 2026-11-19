import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_OTP, requestMockOtp, verifyMockOtp } from '../src/services/mockAuthService.ts';

test('mock OTP request accepts a phone number without Firebase', async () => {
  await assert.doesNotReject(requestMockOtp('+919876543210'));
});

test('demo OTP creates an authenticated mock user', async () => {
  assert.equal(DEMO_OTP, '123123');
  assert.deepEqual(await verifyMockOtp('+919876543210', '123123', 'Asha'), {
    uid: 'mock-919876543210',
    phoneNumber: '+919876543210',
    displayName: 'Asha',
  });
});

test('incorrect demo OTP is rejected', async () => {
  await assert.rejects(
    verifyMockOtp('+919876543210', '111111', ''),
    /Incorrect demo code\. Enter 123123/,
  );
});

test('admin demo OTP authenticates only the configured development phone', async () => {
  const adminDemo = { enabled: true, phoneNumber: '+917644940067', otp: '022007' };
  const admin = await verifyMockOtp('7644940067', '022007', '', adminDemo);
  assert.equal(admin.isAdminDemo, true);
  await assert.rejects(verifyMockOtp('+917644940067', '123123', '', adminDemo), /Incorrect Admin demo code/);
  await assert.rejects(verifyMockOtp('+919999999999', '022007', '', adminDemo), /Incorrect demo code/);
});
