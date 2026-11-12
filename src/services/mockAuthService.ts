import type { AuthUser } from './authTypes';

export const DEMO_OTP = '123123';
const DEMO_RESPONSE_DELAY_MS = 300;

function simulateNetworkDelay(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, DEMO_RESPONSE_DELAY_MS));
}

export async function requestMockOtp(phoneNumber: string): Promise<void> {
  if (!phoneNumber) throw new Error('Enter a mobile number before requesting a code.');
  await simulateNetworkDelay();
}

export async function verifyMockOtp(
  phoneNumber: string,
  code: string,
  displayName: string,
): Promise<AuthUser> {
  await simulateNetworkDelay();
  if (code !== DEMO_OTP) throw new Error('Incorrect demo code. Enter 123123 and try again.');

  return {
    uid: `mock-${phoneNumber.replace(/\D/g, '')}`,
    phoneNumber,
    displayName: displayName || null,
  };
}
