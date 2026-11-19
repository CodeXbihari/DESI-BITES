import type { AuthUser } from './authTypes';

export const DEMO_OTP = '123123';
const DEMO_RESPONSE_DELAY_MS = 300;

export interface AdminDemoCredentials {
  enabled: boolean;
  phoneNumber: string;
  otp: string;
}

export function isAdminDemoPhone(phoneNumber: string, credentials: AdminDemoCredentials): boolean {
  return credentials.enabled && normalizePhone(phoneNumber) === normalizePhone(credentials.phoneNumber);
}

function normalizePhone(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, '');
  return digits.length === 10 ? `91${digits}` : digits;
}

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
  adminDemo: AdminDemoCredentials = { enabled: false, phoneNumber: '', otp: '' },
): Promise<AuthUser> {
  await simulateNetworkDelay();
  const isAdminPhone = isAdminDemoPhone(phoneNumber, adminDemo);
  if (isAdminPhone && code === adminDemo.otp) {
    return {
      uid: `mock-admin-demo-${normalizePhone(phoneNumber)}`,
      phoneNumber,
      displayName: displayName || 'Admin Demo',
      isAdminDemo: true,
    };
  }
  if (isAdminPhone) throw new Error('Incorrect Admin demo code. Use the code shown for this development test account.');
  if (code !== DEMO_OTP) throw new Error('Incorrect demo code. Enter 123123 and try again.');

  return {
    uid: `mock-${phoneNumber.replace(/\D/g, '')}`,
    phoneNumber,
    displayName: displayName || null,
  };
}
