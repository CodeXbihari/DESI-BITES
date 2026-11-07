import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { observeAuth, requestPhoneOtp, signOutUser, saveDisplayName } from '../services/authService';
import { normalizeIndianPhone, RESEND_COOLDOWN_MS, validateOtp, authErrorMessage } from '../services/authValidation';
import type { AuthUser, OtpConfirmation } from '../services/authTypes';

interface AuthContextValue {
  user: AuthUser | null;
  initializing: boolean;
  setupError: string | null;
  profileError: string | null;
  busy: boolean;
  phoneNumber: string | null;
  resendAt: number;
  sendOtp: (phone: string, displayName?: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const pendingName = useRef('');
  const authenticatedUid = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [resendAt, setResendAt] = useState(0);
  const confirmation = useRef<OtpConfirmation | null>(null);
  const lock = useRef(false);
  const cooldown = useRef(0);

  useEffect(() => observeAuth(nextUser => {
    authenticatedUid.current = nextUser?.uid ?? null;
    setUser(nextUser);
    setProfileError(null);
    if (nextUser && pendingName.current) {
      const name = pendingName.current;
      pendingName.current = '';
      void saveDisplayName(name).then(() => {
        setUser(current => current?.uid === nextUser.uid ? { ...current, displayName: name } : current);
      }).catch(() => {
        if (authenticatedUid.current === nextUser.uid) setProfileError('You are signed in, but your profile name could not be saved.');
      });
    }
    setSetupError(null);
    setInitializing(false);
    if (nextUser) confirmation.current = null;
  }, error => {
    authenticatedUid.current = null;
    setUser(null);
    setSetupError(authErrorMessage(error));
    setInitializing(false);
  }), []);

  async function exclusive(action: () => Promise<void>) {
    if (lock.current) throw new Error('Please wait for the current request to finish.');
    lock.current = true;
    setBusy(true);
    try { await action(); } finally { lock.current = false; setBusy(false); }
  }

  async function sendOtp(value: string, displayName?: string) {
    const phone = normalizeIndianPhone(value);
    await exclusive(async () => {
      if (Date.now() < cooldown.current) throw new Error('Please wait before requesting another OTP.');
      const previousName = pendingName.current;
      if (displayName !== undefined) pendingName.current = displayName.trim().slice(0, 80);
      let next: OtpConfirmation;
      try { next = await requestPhoneOtp(phone); }
      catch (error) { pendingName.current = previousName; throw error; }
      if (authenticatedUid.current) return;
      confirmation.current = next;
      setPhoneNumber(phone);
      cooldown.current = Date.now() + RESEND_COOLDOWN_MS;
      setResendAt(cooldown.current);
      setSetupError(null);
    });
  }

  async function verifyOtp(code: string) {
    validateOtp(code);
    await exclusive(async () => {
      if (!confirmation.current) throw new Error('Please request a new OTP from the login screen.');
      await confirmation.current.confirm(code);
      // Only the Firebase observer grants access to protected routes.
    });
  }

  async function logout() {
    await exclusive(async () => {
      await signOutUser();
      confirmation.current = null;
      pendingName.current = '';
      setProfileError(null);
      setPhoneNumber(null);
      cooldown.current = 0;
      setResendAt(0);
    });
  }

  return <AuthContext.Provider value={{ user, initializing, setupError, profileError, busy, phoneNumber, resendAt, sendOtp, verifyOtp, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
