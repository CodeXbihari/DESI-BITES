import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { homeTheme as theme } from '../../theme/homeTheme';
import { normalizeIndianPhone, validateOtp, authErrorMessage } from '../../services/authValidation';
import type { OtpConfirmation } from '../../services/authTypes';
import * as firebaseAuth from '../../services/authService';
import { AdminNavigator } from './AdminNavigator';
import { AdminDemoProvider } from './state/AdminDemoContext';
import { canAccessAdmin, canRequestAdminOtp } from './adminAccess';

export function AdminAuthExperience({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<'checking' | 'phone' | 'code' | 'authorized'>('checking');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const confirmation = useRef<OtpConfirmation | null>(null);
  const serial = useRef(0);

  useEffect(() => {
    let active = true;
    const unsubscribe = firebaseAuth.observeAuth(async user => {
      const current = ++serial.current;
      if (!user) {
        if (active) setPhase('phone');
        return;
      }
      try {
        const allowed = await firebaseAuth.getAdminClaim();
        if (!active || current !== serial.current) return;
        if (canAccessAdmin(allowed, user.phoneNumber, __DEV__)) {
          setError('');
          setPhase('authorized');
        } else {
          await firebaseAuth.signOutUser();
          if (active) setError('This account does not have Admin access.');
        }
      } catch (cause) {
        if (active && current === serial.current) {
          setPhase('phone');
          setError(authErrorMessage(cause));
        }
      }
    }, cause => {
      if (active) { setPhase('phone'); setError(authErrorMessage(cause)); }
    });
    return () => { active = false; serial.current++; unsubscribe(); };
  }, []);

  async function sendCode() {
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      const normalized = normalizeIndianPhone(phone);
      if (!canRequestAdminOtp(normalized, __DEV__)) throw new Error('This number is not configured for Admin testing.');
      confirmation.current = await firebaseAuth.requestPhoneOtp(normalized);
      setPhone(normalized);
      setPhase('code');
    } catch (cause) { setError(authErrorMessage(cause)); }
    finally { setBusy(false); }
  }

  async function verifyCode() {
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      validateOtp(code);
      if (!confirmation.current) throw new Error('Request a verification code first.');
      setPhase('checking');
      await confirmation.current.confirm(code);
      // The Firebase observer checks a fresh ID token before opening Admin screens.
    } catch (cause) { setPhase('code'); setError(authErrorMessage(cause)); }
    finally { setBusy(false); }
  }

  async function logout() {
    try {
      await firebaseAuth.signOutUser();
      confirmation.current = null;
      setCode('');
      onExit();
    } catch (cause) { Alert.alert('Sign out failed', authErrorMessage(cause)); }
  }

  if (phase === 'authorized') return (
    <SafeAreaProvider><AdminDemoProvider><NavigationContainer><AdminNavigator onExit={() => void logout()} /></NavigationContainer></AdminDemoProvider></SafeAreaProvider>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <View style={styles.card}>
          <Text style={styles.brand}>DESI BITES · CAFÉ</Text>
          <Text style={styles.title}>Admin sign-in</Text>
          <Text style={styles.subtitle}>Verify your phone to access restaurant management.</Text>
          {phase === 'checking' ? <ActivityIndicator color={theme.primary} /> : <>
            <Text style={styles.label}>{phase === 'phone' ? 'MOBILE NUMBER' : 'VERIFICATION CODE'}</Text>
            {phase === 'phone' ? <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" placeholder="+91 7644940067" placeholderTextColor={theme.muted} accessibilityLabel="Admin mobile number" />
              : <TextInput style={styles.input} value={code} onChangeText={value => setCode(value.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" autoComplete="sms-otp" maxLength={6} placeholder="6-digit code" placeholderTextColor={theme.muted} accessibilityLabel="Admin verification code" />}
            {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
            <Pressable style={styles.button} disabled={busy} onPress={phase === 'phone' ? sendCode : verifyCode} accessibilityRole="button"><Text style={styles.buttonText}>{busy ? 'Please wait…' : phase === 'phone' ? 'Send verification code' : 'Verify and continue'}</Text></Pressable>
            {phase === 'code' ? <Pressable onPress={() => { setCode(''); confirmation.current = null; setPhase('phone'); }}><Text style={styles.link}>Change number</Text></Pressable> : null}
          </>}
          <Pressable onPress={onExit} accessibilityRole="button"><Text style={styles.link}>Return to customer app</Text></Pressable>
          {__DEV__ ? <Text style={styles.dev}>DEVELOPMENT · Firebase test phone sign-in</Text> : null}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.background, justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 430, alignSelf: 'center', padding: 25, backgroundColor: theme.card, borderRadius: 24, borderWidth: 1, borderColor: theme.border, gap: 14 },
  brand: { color: theme.primary, fontWeight: '900', letterSpacing: 2, fontSize: 15 },
  title: { color: theme.text, fontFamily: theme.headingFont, fontWeight: '800', fontSize: 28 },
  subtitle: { color: theme.muted, fontSize: 13, lineHeight: 19 },
  label: { color: theme.text, fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  input: { borderWidth: 1, borderColor: theme.border, backgroundColor: theme.background, borderRadius: 13, padding: 14, color: theme.text, fontSize: 16 },
  button: { backgroundColor: theme.primary, borderRadius: 14, minHeight: 50, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: theme.card, fontWeight: '800' },
  error: { color: '#9D1823', fontSize: 12 },
  link: { color: theme.primary, fontWeight: '700', textAlign: 'center', padding: 6 },
  dev: { color: theme.muted, fontSize: 10, textAlign: 'center', letterSpacing: 1 },
});
