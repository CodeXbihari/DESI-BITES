import React, { createContext, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import { useAuth } from './AuthContext';
import { createRepositories } from '../backend/createRepositories';
import { createCustomerAccountSession, selectedCustomerAddress, type AccountBinding } from '../services/customerAccount';

// Repository-owned memory, separate from React state. Each authenticated UID
// has its own store for this development runtime; full page reload clears it.
const demos = new Map<string, Promise<AccountBinding>>();
function demoBinding(uid: string): Promise<AccountBinding> {
  if (!demos.has(uid)) demos.set(uid, createRepositories({ authMode: 'mock', platform: Platform.OS === 'android' ? 'android' : 'web', demoUid: uid })
    .then(repository => ({ repository, getUid: () => uid })));
  return demos.get(uid)!;
}
type Session = ReturnType<typeof createCustomerAccountSession>;
type Value = ReturnType<Session['getSnapshot']> & Pick<Session, 'retry' | 'saveProfile' | 'saveAddress' | 'removeAddress' | 'selectAddress' | 'setDefaultAddress'> & {
  selectedAddress: ReturnType<typeof selectedCustomerAddress>;
};
const Context = createContext<Value | null>(null);

export function CustomerAccountProvider({ children, binding }: { children: React.ReactNode; binding?: AccountBinding }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const currentUid = useRef(uid);
  currentUid.current = uid;
  const session = useMemo(() => createCustomerAccountSession(uid, () => currentUid.current, async () => {
    if (!__DEV__) throw new Error('Customer account integration supports development demo/emulator only.');
    return binding ?? demoBinding(uid!);
  }), [uid, binding]);
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  useEffect(() => { session.start(); return () => session.dispose(); }, [session]);
  const value: Value = { ...state, selectedAddress: selectedCustomerAddress(state), retry: session.retry,
    saveProfile: session.saveProfile, saveAddress: session.saveAddress, removeAddress: session.removeAddress,
    selectAddress: session.selectAddress, setDefaultAddress: session.setDefaultAddress };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCustomerAccount() {
  const value = useContext(Context);
  if (!value) throw new Error('CustomerAccountProvider is required.');
  return value;
}
