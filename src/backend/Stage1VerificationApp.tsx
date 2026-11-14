import React, { useEffect, useState } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';
import type { Repositories } from './repositories';
import { bootstrapNativeStage1 } from './nativeStage1Bootstrap';

// Synthetic accounts exist only after the guarded local seeder runs. This is
// a repository test harness, not a customer/owner/admin replacement screen.
const password = 'Stage1_synthetic_only_123!';

export default function Stage1VerificationApp() {
  const [repositories, setRepositories] = useState<Repositories | null>(null);
  const [message, setMessage] = useState('Checking native Stage 1 identity…');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    void bootstrapNativeStage1().then(r => {
      if (active) { setRepositories(r); setMessage('Native setup ready. USB forwarding and running emulators are required.'); }
    }).catch(() => { if (active) setMessage('BLOCKED: Native Stage 1 identity or initialization failed. No fallback.'); });
    return () => { active = false; };
  }, []);

  async function run(action: () => Promise<unknown>) {
    if (!repositories || busy) return;
    setBusy(true);
    try { await action(); setMessage('Operation succeeded against the configured local emulators.'); }
    catch { setMessage('Operation failed or access denied. Check emulator availability, fixtures and permissions. No fallback.'); }
    finally { setBusy(false); }
  }
  async function signIn(identity: 'customer' | 'owner' | 'unprivileged') {
    const { getAuth, signInWithEmailAndPassword } = await import('@react-native-firebase/auth');
    await signInWithEmailAndPassword(getAuth(), `stage1-${identity}@example.invalid`, password);
  }
  return <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
    <Text accessibilityRole="header">Desii Bites — Stage 1 native verification</Text>
    <Text>Synthetic local test identities only. No real admin authority, customer checkout or order creation.</Text>
    <Text accessibilityLiveRegion="polite">{message}</Text>
    {repositories && <View style={{ gap: 12 }}>
      <Button disabled={busy} title="Sign in synthetic customer" onPress={() => void run(() => signIn('customer'))} />
      <Button disabled={busy} title="Sign in synthetic owner" onPress={() => void run(() => signIn('owner'))} />
      <Button disabled={busy} title="Sign in unprivileged identity" onPress={() => void run(() => signIn('unprivileged'))} />
      <Button disabled={busy} title="Read published fixture menu" onPress={() => void run(() => repositories.menu.list('shop-a'))} />
      <Button disabled={busy} title="Read own profile" onPress={() => void run(() => repositories.profile.get())} />
      <Button disabled={busy} title="Read owner-only fixture menu" onPress={() => void run(() => repositories.menu.ownerList('shop-a'))} />
      <Button disabled={busy} title="Sign out" onPress={() => void run(async () => {
        const { getAuth, signOut } = await import('@react-native-firebase/auth'); await signOut(getAuth());
      })} />
    </View>}
  </ScrollView>;
}
