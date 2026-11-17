import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { HttpsError } from 'firebase-functions/v2/https';
import type { Entity, Instant, Order, OrderStatusHistory } from '../../src/backend/types.ts';
import { exact, id, instant, record, validateHistory, validateOrder } from '../../src/backend/validation.ts';
import { buildDemoQuote, initialOrderFromQuote, type TrustedDemoQuote } from './domain/quote.ts';
import { validateConfirmation, validateSubmission } from './domain/submission.ts';
import { readQuoteContext, type QuoteRequest } from './quoteService.ts';
import { QUOTES_COLLECTION } from './emulatorOnly.ts';

export const SUBMISSIONS_COLLECTION = 'orderSubmissions';
export interface SubmissionReceipt { customerUid: string; quoteId: string; orderId: string; createdAt: Instant }
export interface OrderTransaction {
  get(path: string): Promise<unknown | null>;
  createOrder(orderId: string, order: Order): void;
  createHistory(orderId: string, history: OrderStatusHistory): void;
  consumeQuote(quoteId: string, orderId: string): void;
  createReceipt(receiptId: string, receipt: SubmissionReceipt): void;
}
export interface OrderStore {
  newOrderId(): string;
  transaction<T>(run: (tx: OrderTransaction) => Promise<T>): Promise<T>;
  getOrder(orderId: string): Promise<unknown | null>;
}
export function submissionReceiptId(uid: string, key: string): string {
  return createHash('sha256').update(uid).update('\0').update(key).digest('hex');
}
function authenticatedUid(request: QuoteRequest): string {
  if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Sign in to access orders.');
  try { return id(request.auth.uid); } catch { throw new HttpsError('unauthenticated', 'Invalid customer identity.'); }
}
function stale(): never { throw new HttpsError('failed-precondition', 'Quote is expired, used, invalid or changed. Request a new quote and review it.'); }
function snapshot(order: Order) {
  const { createdAt: _created, updatedAt: _updated, ...data } = order;
  return data;
}
function ownedOrder(value: unknown, orderId: string, uid: string): Entity<Order> {
  if (!value || record(value).customerUid !== uid) throw new HttpsError('not-found', 'Order is not available.');
  validateOrder(value);
  return { id: orderId, data: value as Order };
}
function storedQuote(value: unknown, quoteId: string, uid: string): TrustedDemoQuote {
  if (!value || record(value).customerUid !== uid) throw new HttpsError('not-found', 'Quote is not available.');
  try {
    const q = exact(value, ['id', 'policyId', 'createdAt', 'expiresAt', 'consumedOrderId', 'submission', 'order', 'customerUid', 'shopId']);
    if (q.id !== quoteId) stale();
    validateOrder(q.order);
    const quote = q as unknown as TrustedDemoQuote;
    if (quote.order.customerUid !== uid || q.shopId !== quote.order.shopId || quote.order.status !== 'placed' || quote.order.statusVersion !== 1) stale();
    if (!isDeepStrictEqual(validateSubmission(quote.submission), quote.submission)) stale();
    instant(quote.createdAt); instant(quote.expiresAt);
    return quote;
  } catch { return stale(); }
}

export function createConfirmationHandler(store: OrderStore, clock: () => Instant) {
  return async (request: QuoteRequest): Promise<Entity<Order>> => {
    const uid = authenticatedUid(request);
    let input;
    try { input = validateConfirmation(request.data); }
    catch { throw new HttpsError('invalid-argument', 'Supply only a valid quote ID and submission key.'); }
    const { quoteId, submissionKey } = input;
    const receiptId = submissionReceiptId(uid, submissionKey);
    // Stable across transaction retries; no external side effects in the callback.
    const orderId = store.newOrderId();
    try {
      return await store.transaction(async tx => {
        // Receipt precedes expiry/current-menu checks: a lost response is safe to retry.
        const receiptValue = await tx.get(`${SUBMISSIONS_COLLECTION}/${receiptId}`);
        if (receiptValue) {
          const receipt = exact(receiptValue, ['customerUid', 'quoteId', 'orderId', 'createdAt']);
          if (receipt.customerUid !== uid) throw new HttpsError('permission-denied', 'Submission identity mismatch.');
          if (receipt.quoteId !== quoteId) throw new HttpsError('already-exists', 'Submission key was already used for another quote.');
          const existingId = id(receipt.orderId);
          return ownedOrder(await tx.get(`orders/${existingId}`), existingId, uid);
        }
        const quote = storedQuote(await tx.get(`${QUOTES_COLLECTION}/${quoteId}`), quoteId, uid);
        let order: Order;
        const context = await readQuoteContext(tx, uid, quote.submission);
        const now = clock();
        try {
          order = initialOrderFromQuote(quote, uid, now);
          const current = buildDemoQuote(quote.submission, context, now, quoteId);
          if (!isDeepStrictEqual(snapshot(order), snapshot(current.order))) stale();
        } catch { return stale(); }
        const history: OrderStatusHistory = { fromStatus: null, toStatus: 'placed', actorUid: uid,
          actorRole: 'customer', statusVersion: 1, createdAt: { ...now } };
        validateHistory(history);
        // All reads precede these writes. Adapter commits all four or none.
        tx.createOrder(orderId, order);
        tx.createHistory(orderId, history);
        tx.consumeQuote(quoteId, orderId);
        tx.createReceipt(receiptId, { customerUid: uid, quoteId, orderId, createdAt: { ...now } });
        return { id: orderId, data: order };
      });
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('unavailable', 'Confirmation could not be completed. Retry with the same quote and submission key.');
    }
  };
}

export function createOrderLookupHandler(store: OrderStore) {
  return async (request: QuoteRequest): Promise<Entity<Order>> => {
    const uid = authenticatedUid(request);
    let orderId: string;
    try { orderId = id(exact(request.data, ['orderId']).orderId); }
    catch { throw new HttpsError('invalid-argument', 'Supply only a valid order ID.'); }
    try { return ownedOrder(await store.getOrder(orderId), orderId, uid); }
    catch (error) {
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('unavailable', 'Order could not be loaded. Retry.');
    }
  };
}
