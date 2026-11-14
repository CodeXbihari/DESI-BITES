import type { AuthUser, OtpConfirmation } from './authTypes';

// Load only on use so missing native modules produce a setup error, not an app crash.
function nativeAuth() {
  try {
    const sdk = require('@react-native-firebase/auth') as typeof import('@react-native-firebase/auth');
    return { sdk, auth: sdk.getAuth() };
  } catch {
    throw new Error('Phone sign-in needs a Firebase-configured development build. It is unavailable in Expo Go. See README.md.');
  }
}

export function observeAuth(callback: (user: AuthUser | null) => void, onError: (error: unknown) => void): () => void {
  try {
    const { sdk, auth } = nativeAuth();
    return sdk.onAuthStateChanged(auth, (user) => callback(user?.phoneNumber ? user : null), onError);
  } catch (error) {
    onError(error);
    return () => {};
  }
}

export async function requestPhoneOtp(phone: string): Promise<OtpConfirmation> {
  const { sdk, auth } = nativeAuth();
  return sdk.signInWithPhoneNumber(auth, phone);
}

export async function signOutUser(): Promise<void> {
  const { sdk, auth } = nativeAuth();
  await sdk.signOut(auth);
}

export async function saveDisplayName(displayName: string): Promise<void> {
  const { sdk, auth } = nativeAuth();
  if (!auth.currentUser) throw new Error('Sign in before updating your name.');
  await sdk.updateProfile(auth.currentUser, { displayName });
}
