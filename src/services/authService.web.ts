import { onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber, signOut } from 'firebase/auth';
import { getWebAuth } from '../config/firebase.web';
import type { AuthUser, OtpConfirmation } from './authTypes';

export function observeAuth(callback: (user: AuthUser | null) => void, onError: (error: unknown) => void): () => void {
  try {
    return onAuthStateChanged(getWebAuth(), user => callback(user?.phoneNumber ? user : null), onError);
  } catch (error) {
    onError(error);
    return () => {};
  }
}

export async function requestPhoneOtp(phone: string): Promise<OtpConfirmation> {
  const auth = getWebAuth();
  const panel = document.createElement('div');
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Phone sign-in security verification');
  Object.assign(panel.style, {
    position: 'fixed', bottom: '16px', left: '8px', zIndex: '99999',
    background: '#FFF0D7', padding: '8px', borderRadius: '8px', maxWidth: 'calc(100vw - 16px)',
  });
  const challenge = document.createElement('div');
  const cancel = document.createElement('button');
  cancel.textContent = 'Cancel verification';
  panel.append(challenge, cancel);
  document.body.appendChild(panel);
  let verifier: RecaptchaVerifier | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const cancellation = new Promise<never>((_, reject) => {
      cancel.onclick = () => reject(new Error('Security verification cancelled. Please try again.'));
      timeout = setTimeout(() => reject(new Error('Security verification timed out. Please try again.')), 120_000);
    });
    verifier = new RecaptchaVerifier(auth, challenge, { size: 'normal' });
    return await Promise.race([signInWithPhoneNumber(auth, phone, verifier), cancellation]);
  } finally {
    clearTimeout(timeout);
    verifier?.clear();
    panel.remove();
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(getWebAuth());
}

export async function saveDisplayName(displayName: string): Promise<void> {
  const { updateProfile } = await import('firebase/auth');
  const user = getWebAuth().currentUser;
  if (!user) throw new Error('Sign in before updating your name.');
  await updateProfile(user, { displayName });
}
