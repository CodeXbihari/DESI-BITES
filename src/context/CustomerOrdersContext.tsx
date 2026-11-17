import React, { createContext, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { useApp } from './AppContext';
import { createCustomerOrderSession, type OrderSessionState } from '../services/customerOrderSession';
import type { CustomerOrderApi } from '../services/customerOrders';

type Session = ReturnType<typeof createCustomerOrderSession>;
export type CustomerOrdersValue = OrderSessionState & Pick<Session, 'history' | 'quote' | 'confirm' | 'updateDraft' | 'loadOrder'> & { enabled: boolean };
export const BLOCKED_ORDERS: CustomerOrdersValue = { enabled: false, restoring: false, orders: [], loading: false,
  error: 'Persistent orders require browser emulator sign-in. Mock/demo sessions cannot place orders.', more: false,
  phase: 'idle', attempt: null, checkoutError: null, success: null, detail: null, detailId: null, detailLoading: false, detailError: null,
  history: async () => {}, quote: async () => {}, confirm: async () => {}, updateDraft: () => {}, loadOrder: async () => {} };
const Context = createContext<CustomerOrdersValue>(BLOCKED_ORDERS);
export function CustomerOrdersProvider({ children, api }: { children: React.ReactNode; api: CustomerOrderApi | null }) {
  return api ? <ActiveOrders api={api}>{children}</ActiveOrders> : <Context.Provider value={BLOCKED_ORDERS}>{children}</Context.Provider>;
}
function ActiveOrders({ children, api }: { children: React.ReactNode; api: CustomerOrderApi }) {
  const { user } = useAuth(); const { clearSubmittedCart } = useApp();
  const uid = user?.uid ?? '';
  const currentUid = useRef(uid); currentUid.current = uid;
  const clear = useRef(clearSubmittedCart); clear.current = clearSubmittedCart;
  const session = useMemo(() => {
    const key = `@desi_pending_order_${uid}`;
    return createCustomerOrderSession(uid, () => currentUid.current, api, {
      get: () => AsyncStorage.getItem(key), set: value => AsyncStorage.setItem(key, value), clear: () => AsyncStorage.removeItem(key),
    }, (_order, cart) => { clear.current(cart); });
  }, [uid, api]);
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  useEffect(() => { void session.start(); return () => session.dispose(); }, [session]);
  return <Context.Provider value={{ ...state, enabled: true, history: session.history, quote: session.quote,
    confirm: session.confirm, updateDraft: session.updateDraft, loadOrder: session.loadOrder }}>{children}</Context.Provider>;
}
export function useCustomerOrders() { return useContext(Context); }
