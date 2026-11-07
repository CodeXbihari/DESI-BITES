export const OTP_LENGTH = 6;
export const RESEND_COOLDOWN_MS = 60_000;

export function normalizeIndianPhone(value: string): string {
  const compact = value.replace(/[\s()-]/g, '');
  const national = compact.startsWith('+91') ? compact.slice(3) : compact;
  if (!/^[6-9]\d{9}$/.test(national)) {
    throw new Error('Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9.');
  }
  return `+91${national}`;
}

export function validateOtp(code: string): void {
  if (!/^\d{6}$/.test(code)) throw new Error('Enter the complete six-digit SMS code.');
}

export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  const messages: Record<string, string> = {
    'auth/invalid-api-key': 'Firebase client configuration is invalid. Check the configured API key.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/invalid-verification-id': 'This verification session is invalid. Please request a new OTP.',
    'auth/missing-verification-id': 'Please request a new OTP from the login screen.',
    'auth/invalid-phone-number': 'Enter a valid Indian mobile number.',
    'auth/invalid-verification-code': 'That code is incorrect. Please try again.',
    'auth/code-expired': 'This code has expired. Please request a new OTP.',
    'auth/session-expired': 'This verification session has expired. Please request a new OTP.',
    'auth/too-many-requests': 'Too many attempts. Please wait before trying again.',
    'auth/quota-exceeded': 'SMS is temporarily unavailable. Please try again later.',
    'auth/network-request-failed': 'Check your internet connection and try again.',
    'auth/captcha-check-failed': 'Verification failed. Please retry the security check.',
    'auth/missing-app-credential': 'App verification could not start. Please try again.',
    'auth/invalid-app-credential': 'App verification failed. Check the Firebase platform configuration.',
    'auth/unauthorized-domain': 'This website domain is not enabled for Firebase sign-in.',
    'auth/operation-not-allowed': 'Phone sign-in is not enabled in Firebase.',
    'auth/billing-not-enabled': 'SMS sign-in is unavailable until Firebase billing is configured.',
    'auth/app-not-authorized': 'This app is not authorized for phone sign-in. Check Firebase configuration.',
  };
  if (code) return messages[code] ?? 'Authentication failed. Please try again.';
  return error instanceof Error ? error.message : 'Authentication failed. Please try again.';
}
