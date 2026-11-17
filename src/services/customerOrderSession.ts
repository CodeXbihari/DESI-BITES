import type { Entity, Order } from '../backend/types';
import { validateQuoteReview, type CustomerOrderApi, type OrderSubmission, type QuoteReview } from './customerOrders.ts';

export interface CartSubmission { uid: string; version: number; instance: string }
export interface CheckoutDraft { input: OrderSubmission; key: string; cart: CartSubmission }
interface Attempt { quote: QuoteReview; draft: CheckoutDraft; submissionKey: string }
export interface OrderSessionState {
  restoring: boolean;
  orders: Entity<Order>[]; loading: boolean; error: string | null; more: boolean;
  phase: 'idle' | 'quoting' | 'review' | 'confirming' | 'uncertain' | 'error' | 'success';
  attempt: Attempt | null; checkoutError: string | null; success: Entity<Order> | null;
  detail: Entity<Order> | null; detailId: string | null; detailLoading: boolean; detailError: string | null;
}
export interface PendingOrderStorage { get(): Promise<string | null>; set(value: string): Promise<void>; clear(): Promise<void> }
export function createCustomerOrderSession(uid: string, getUid: () => string | null, api: CustomerOrderApi,
  storage: PendingOrderStorage, confirmed: (order: Entity<Order>, cart: CartSubmission) => void) {
  let active = false, historyVersion = 0, quoteVersion = 0, detailVersion = 0;
  let confirming = false, draftKey: string | null = null;
  let state: OrderSessionState = { restoring: true, orders: [], loading: true, error: null, more: true, phase: 'idle', attempt: null,
    checkoutError: null, success: null, detail: null, detailId: null, detailLoading: false, detailError: null };
  const listeners = new Set<() => void>();
  const current = () => active && getUid() === uid && api.uid === uid;
  const publish = (patch: Partial<OrderSessionState>) => { if (current()) { state = { ...state, ...patch }; listeners.forEach(fn => fn()); } };
  async function history(more = false) {
    if (!current() || (more && (state.loading || !state.more))) return;
    const ticket = ++historyVersion, previous = more ? state.orders : [];
    publish({ loading: true, error: null });
    try {
      const items = await api.history(more ? previous.at(-1)?.id : undefined);
      if (current() && ticket === historyVersion) publish({ orders: [...new Map([...previous, ...items].map(item => [item.id, item])).values()], loading: false, more: items.length === 20 });
    } catch { if (ticket === historyVersion) publish({ loading: false, error: 'Orders could not be loaded. Retry.' }); }
  }
  async function start() {
    active = true;
    try {
      const saved = await storage.get();
      if (!current()) return;
      if (saved) {
        const value = JSON.parse(saved) as Attempt;
        if (value.draft.cart.uid !== uid || !/^[A-Za-z0-9_-]{32,128}$/.test(value.submissionKey)) throw new Error('Invalid saved attempt');
        validateQuoteReview(value.quote, uid, value.draft.input.shopId);
        publish({ attempt: value, phase: 'uncertain', checkoutError: 'A previous submission needs checking. Retry it with the same key before placing another order.' });
      }
    } catch { publish({ phase: 'uncertain', checkoutError: 'Pending submission could not be restored. Reload before placing another order.' }); }
    publish({ restoring: false }); void history();
  }
  function updateDraft(draft: CheckoutDraft) {
    draftKey = draft.key;
    if (state.phase === 'review' && state.attempt?.draft.key !== draft.key) {
      quoteVersion++; publish({ attempt: null, phase: 'idle', checkoutError: 'Checkout changed. Request and review a new quote.' });
    }
  }
  async function quote(draft: CheckoutDraft) {
    if (!current() || state.restoring || ['confirming', 'uncertain', 'quoting'].includes(state.phase)) return;
    const ticket = ++quoteVersion; draftKey = draft.key;
    publish({ phase: 'quoting', checkoutError: null, attempt: null, success: null });
    try {
      const result = await api.quote(draft.input);
      if (!current() || ticket !== quoteVersion) return;
      if (draftKey !== draft.key) { publish({ phase: 'idle', checkoutError: 'Checkout changed. Request a new quote.' }); return; }
      publish({ phase: 'review', attempt: { quote: result, draft: structuredClone(draft), submissionKey: api.newKey() } });
    } catch { if (ticket === quoteVersion) publish({ phase: 'error', checkoutError: 'Quote could not be loaded. Check your cart/address and request a new quote.' }); }
  }
  async function confirm() {
    const attempt = state.attempt;
    if (!current() || confirming || !attempt || !['review', 'uncertain'].includes(state.phase)) return;
    if (state.phase === 'review' && draftKey !== attempt.draft.key) { publish({ phase: 'idle', attempt: null, checkoutError: 'Checkout changed. Review a new quote.' }); return; }
    confirming = true; publish({ phase: 'confirming', checkoutError: null });
    try {
      // Save before sending. A reload/network timeout cannot replace this key.
      await storage.set(JSON.stringify(attempt)); if (!current()) return;
      const order = await api.confirm({ quoteId: attempt.quote.quoteId, submissionKey: attempt.submissionKey });
      if (!current()) return;
      historyVersion++;
      confirmed(order, attempt.draft.cart);
      publish({ phase: 'success', attempt: null, success: order, loading: false, error: null, orders: [order, ...state.orders.filter(item => item.id !== order.id)] });
      try { await storage.clear(); } catch { /* Existing key remains recoverable; never create a second attempt automatically. */ }
    } catch (error) {
      if (!current()) return;
      const code = (error as { code?: string }).code ?? '';
      if (['functions/failed-precondition', 'functions/invalid-argument', 'functions/not-found', 'functions/permission-denied', 'functions/unauthenticated'].includes(code)) {
        // Definitive rejection: no confirmation committed for this attempt.
        try { await storage.clear(); } catch { /* Retry still cannot duplicate a committed order. */ }
        publish({ phase: 'error', attempt: null, checkoutError: 'Order was rejected. Sign in if needed, then request and review a new quote.' });
      } else publish({ phase: 'uncertain', checkoutError: 'The result is uncertain. Retry this submission to check for the same order. Do not place another order.' });
    } finally { confirming = false; }
  }
  async function loadOrder(orderId: string) {
    const ticket = ++detailVersion; publish({ detailId: orderId, detail: null, detailLoading: true, detailError: null });
    try { const detail = await api.get(orderId); if (ticket === detailVersion) publish({ detail, detailLoading: false }); }
    catch { if (ticket === detailVersion) publish({ detailLoading: false, detailError: 'Order is unavailable or could not be loaded. Retry.' }); }
  }
  return { getSnapshot: () => state, subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
    start, dispose() { active = false; historyVersion++; quoteVersion++; detailVersion++; listeners.clear(); },
    history, updateDraft, quote, confirm, loadOrder };
}
