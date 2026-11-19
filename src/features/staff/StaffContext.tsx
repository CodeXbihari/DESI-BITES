import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { checkCredentials, createStaffData, progressOrder, removeDeliveryPartner, saveDeliveryPartner } from './staffDemo';
import { STAFF_DEMO_ENABLED } from './staffDemo';
import type { DeliveryStatus, PartnerDraft, StaffAccount, StaffData } from './staffDemo';

const storageKey = 'desi-bites.staff-demo.v1';
const web = Platform.OS === 'web' && typeof window !== 'undefined';

type Snapshot = { data: StaffData; sessionId: string | null };

function activeAccount(snapshot: Snapshot): StaffAccount | undefined {
  return snapshot.data.accounts.find(account => account.id === snapshot.sessionId && account.active);
}

async function readSnapshot(): Promise<Snapshot> {
  const raw = web ? window.localStorage.getItem(storageKey) : await AsyncStorage.getItem(storageKey);
  if (raw === null) return { data: createStaffData(), sessionId: null };
  const value = JSON.parse(raw) as Snapshot;
  if (!Array.isArray(value?.data?.accounts) || !Array.isArray(value.data.orders)) {
    throw new Error('The saved staff demo data could not be read.');
  }
  return value;
}

async function writeSnapshot(snapshot: Snapshot) {
  const raw = JSON.stringify(snapshot);
  if (web) window.localStorage.setItem(storageKey, raw);
  else await AsyncStorage.setItem(storageKey, raw);
}

type AccountView = Omit<StaffAccount, 'pin'>;

interface StaffContextValue {
  account: AccountView | undefined;
  loading: boolean;
  error: string | null;
  partners: AccountView[];
  orders: StaffData['orders'];
  reload: () => void;
  login: (phone: string, pin: string) => Promise<void>;
  hasDeliveryPhone: (phone: string) => boolean;
  activateAdminDemo: () => Promise<void>;
  logout: () => Promise<void>;
  savePartner: (draft: PartnerDraft, id?: string) => Promise<void>;
  setPartnerActive: (id: string, active: boolean) => Promise<void>;
  resetPartnerPin: (id: string, pin: string) => Promise<void>;
  deletePartner: (id: string) => Promise<void>;
  advanceOrder: (id: string, status: DeliveryStatus) => Promise<void>;
}

const StaffContext = createContext<StaffContextValue | null>(null);

function withoutPin(account: StaffAccount): AccountView {
  const { pin: _pin, ...view } = account;
  return view;
}

function requireRole(snapshot: Snapshot, role: StaffAccount['role']): StaffAccount {
  const account = activeAccount(snapshot);
  if (!account || account.role !== role) throw new Error('This demo session no longer has access.');
  return account;
}

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const locked = useRef(false);

  async function reload() {
    try {
      const next = await readSnapshot();
      setSnapshot(next);
      setError(null);
    } catch {
      setError('Staff demo storage is unavailable. Check that local storage is enabled and try again.');
    }
  }

  useEffect(() => {
    void reload();
    if (!web) return;
    const sync = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) void reload();
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  async function change(update: (current: Snapshot) => Snapshot) {
    if (locked.current) throw new Error('Please wait for the current action to finish.');
    locked.current = true;
    try {
      const current = await readSnapshot();
      const next = update(current);
      await writeSnapshot(next);
      setSnapshot(next);
    } finally {
      locked.current = false;
    }
  }

  function updateData(role: StaffAccount['role'], update: (data: StaffData, actor: StaffAccount) => StaffData) {
    return change(current => {
      const data = update(current.data, requireRole(current, role));
      const next = { ...current, data };
      if (!activeAccount(next)) next.sessionId = null;
      return next;
    });
  }

  const currentAccount = snapshot ? activeAccount(snapshot) : undefined;
  const accounts = snapshot?.data.accounts ?? [];
  const orders = snapshot?.data.orders ?? [];

  return (
    <StaffContext.Provider value={{
      account: currentAccount ? withoutPin(currentAccount) : undefined,
      loading: snapshot === null && error === null,
      error,
      partners: currentAccount?.role === 'admin' ? accounts.filter(account => account.role === 'delivery').map(withoutPin) : [],
      orders: currentAccount?.role === 'admin' ? orders : orders.filter(order => Boolean(currentAccount) && order.partnerId === currentAccount?.id),
      reload: () => { void reload(); },
      login: (phone, pin) => {
        if (!STAFF_DEMO_ENABLED) return Promise.reject(new Error('Delivery PIN preview is available only in development.'));
        return change(current => ({ ...current, sessionId: checkCredentials(current.data, phone, pin).id }));
      },
      hasDeliveryPhone: phone => STAFF_DEMO_ENABLED && Boolean(snapshot?.data.accounts.some(account => account.role === 'delivery' && account.phone === phone.replace(/\D/g, '').slice(-10))),
      activateAdminDemo: () => change(current => {
        if (!STAFF_DEMO_ENABLED) throw new Error('Admin demo is available only in development.');
        if (!current.data.accounts.some(account => account.id === 'demo-admin' && account.role === 'admin')) {
          throw new Error('Admin demo account is unavailable.');
        }
        return { ...current, sessionId: 'demo-admin' };
      }),
      logout: () => change(current => ({ ...current, sessionId: null })),
      savePartner: (draft, id) => updateData('admin', data => {
        const previous = id ? data.accounts.find(item => item.id === id) : undefined;
        const partnerId = id ?? `partner-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        return saveDeliveryPartner(data, partnerId, { ...draft, pin: id ? previous?.pin ?? '' : draft.pin }, Boolean(id));
      }),
      setPartnerActive: (id, active) => updateData('admin', data => {
        const partner = data.accounts.find(item => item.id === id && item.role === 'delivery');
        if (!partner) throw new Error('This partner record is no longer available.');
        return saveDeliveryPartner(data, id, { ...partner, active }, true);
      }),
      resetPartnerPin: (id, pin) => updateData('admin', data => {
        const partner = data.accounts.find(item => item.id === id && item.role === 'delivery');
        if (!partner) throw new Error('This partner record is no longer available.');
        return saveDeliveryPartner(data, id, { ...partner, pin }, true);
      }),
      deletePartner: id => updateData('admin', data => removeDeliveryPartner(data, id)),
      advanceOrder: (id, status) => updateData('delivery', (data, actor) => progressOrder(data, actor.id, id, status)),
    }}>{children}</StaffContext.Provider>
  );
}

export function useStaff() {
  const value = useContext(StaffContext);
  if (!value) throw new Error('useStaff requires StaffProvider.');
  return value;
}
