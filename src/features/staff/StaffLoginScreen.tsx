import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStaff } from './StaffContext';
import { errorMessage, PinField, StaffBrand, StaffButton, StaffField, StaffNotice, staffStyles } from './StaffUI';

export function StaffLoginScreen() {
  const { login } = useStaff();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError('');
    try { await login(phone, pin); }
    catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  }

  return (
    <SafeAreaView style={staffStyles.screen}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
          <View style={[staffStyles.card, styles.form]}>
            <StaffBrand />
            <View>
              <Text accessibilityRole="header" style={staffStyles.title}>Welcome Back</Text>
              <Text style={staffStyles.muted}>Sign in to your staff workspace.</Text>
            </View>
            <StaffField label="Mobile Number" value={phone} onChangeText={value => { setPhone(value.replace(/\D/g, '')); setError(''); }}
              keyboardType="number-pad" maxLength={10} editable={!busy} autoComplete="tel-national" placeholder="Enter 10-digit number" />
            <PinField value={pin} onChange={value => { setPin(value); setError(''); }} onSubmit={() => void submit()} disabled={busy} />
            {error ? <StaffNotice message={error} error /> : null}
            <StaffButton label={busy ? 'Signing in…' : 'Login'} icon="arrow-forward" primary busy={busy} onPress={() => void submit()} />
            <Text style={staffStyles.eyebrow}>DEVELOPMENT DEMO</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 16 },
  form: { width: '100%', maxWidth: 410, alignSelf: 'center', gap: 17, padding: 20 },
});
