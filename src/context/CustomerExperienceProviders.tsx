import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from './AuthContext';
import { CustomerAccountProvider } from './CustomerAccountContext';
import { AppProvider } from './AppContext';
import { CustomerMenuProvider } from './CustomerMenuContext';
import { CustomerOrdersProvider } from './CustomerOrdersContext';
import { customerEmulatorEnabled } from '../config/customerEmulator';
import { loadCustomerBackend, type CustomerBackend } from '../services/customerBackend';

export function CustomerExperienceProviders({ children }: { children: React.ReactNode }) {
  const { user, isMockAuth } = useAuth(); const uid = user?.uid ?? '';
  const [attempt, retry] = useState(0);
  const [state, setState] = useState<{ uid: string; backend?: CustomerBackend; error?: string }>({ uid: '' });
  const needsBackend = !!uid && customerEmulatorEnabled() && !isMockAuth;
  useEffect(() => {
    let active = true;
    if (needsBackend) void loadCustomerBackend(uid).then(backend => { if (active) setState({ uid, backend }); })
      .catch(() => { if (active) setState({ uid, error: 'Local Firebase connection failed. Check the emulator suite and retry.' }); });
    return () => { active = false; };
  }, [uid, needsBackend, attempt]);
  const backend = needsBackend && state.uid === uid ? state.backend : undefined;
  if (needsBackend && !backend) return <View><Text>{state.uid === uid && state.error || 'Connecting to local customer services…'}</Text>
    <TouchableOpacity accessibilityRole="button" onPress={() => retry(value => value + 1)}><Text>Retry local services</Text></TouchableOpacity></View>;
  return <CustomerAccountProvider key={uid} binding={backend?.account}><AppProvider>
    <CustomerMenuProvider repository={backend?.repository}>
      <CustomerOrdersProvider api={backend?.orders ?? null}>{children}</CustomerOrdersProvider>
    </CustomerMenuProvider>
  </AppProvider></CustomerAccountProvider>;
}
