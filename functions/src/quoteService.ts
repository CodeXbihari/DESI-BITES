import { HttpsError } from 'firebase-functions/v2/https';
import type { CustomerAddress, Entity, Instant, MenuCategory, Shop } from '../../src/backend/types.ts';
import { id } from '../../src/backend/validation.ts';
import { menuEntity } from '../../src/backend/firestore/mappers.ts';
import { buildDemoQuote, type TrustedDemoQuote, type TrustedQuoteContext } from './domain/quote.ts';
import { validateSubmission, type OrderSubmission } from './domain/submission.ts';

export interface QuoteTransaction {
  get(path: string): Promise<unknown | null>;
  createQuote(quote: TrustedDemoQuote): void;
}
export interface QuoteStore {
  newQuoteId(): string;
  transaction<T>(run: (tx: QuoteTransaction) => Promise<T>): Promise<T>;
}
export interface QuoteRequest { auth?: { uid: string } | null; data: unknown }

// Shared canonical reads for quoting and confirmation, inside the caller's tx.
export async function readQuoteContext(tx: Pick<QuoteTransaction, 'get'>, customerUid: string, submission: OrderSubmission): Promise<TrustedQuoteContext> {
  const shopPath = `shops/${submission.shopId}`;
  const shop = await tx.get(shopPath);
  if (!shop) throw new HttpsError('failed-precondition', 'Shop is not available. Request a new quote.');
  const menuItems = await Promise.all(submission.items.map(async line => {
    const data = await tx.get(`${shopPath}/menuItems/${line.menuItemId}`);
    if (!data) throw new HttpsError('failed-precondition', 'A requested item is not available. Request a new quote.');
    return validateTrusted(() => menuEntity(line.menuItemId, data));
  }));
  const categories = await Promise.all([...new Set(menuItems.map(item => item.data.categoryId))].map(async categoryId => {
    const data = await tx.get(`${shopPath}/menuCategories/${categoryId}`);
    if (!data) throw new HttpsError('failed-precondition', 'A requested category is not available. Request a new quote.');
    return { id: categoryId, data } as Entity<MenuCategory>;
  }));
  let savedAddress: TrustedQuoteContext['savedAddress'];
  if (submission.fulfillment === 'delivery') {
    const data = await tx.get(`users/${customerUid}/addresses/${submission.addressId}`);
    if (!data) throw new HttpsError('failed-precondition', 'Select a valid saved delivery address and request a new quote.');
    savedAddress = { customerUid, address: { id: submission.addressId, data } as Entity<CustomerAddress> };
  }
  return { customerUid, shop: { id: submission.shopId, data: shop } as Entity<Shop>, menuItems, categories, savedAddress };
}

function validateTrusted<T>(run: () => T): T {
  try { return run(); }
  catch { throw new HttpsError('failed-precondition', 'Current shop, menu or saved address cannot be quoted.'); }
}

// Invoked only by onCall after its auth-token verification. Unit callers supply
// auth explicitly; those tests do not establish token-verification coverage.
export function createQuoteHandler(store: QuoteStore, clock: () => Instant) {
  return async (request: QuoteRequest) => {
    if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Sign in to request a quote.');
    let customerUid: string;
    let submission: ReturnType<typeof validateSubmission>;
    try { customerUid = id(request.auth.uid); submission = validateSubmission(request.data); }
    catch { throw new HttpsError('invalid-argument', 'Invalid quote request. Supply item references and quantities only.'); }
    try {
      const quoteId = store.newQuoteId();
      const quote = await store.transaction(async tx => {
        const context = await readQuoteContext(tx, customerUid, submission);
        const result = validateTrusted(() => buildDemoQuote(submission, context, clock(), quoteId));
        tx.createQuote(result);
        return result;
      });
      // Explicit review DTO: no UID, submission key, internal consumed state,
      // profile, Admin configuration or administrative order status.
      const { items, currency, fulfillment, addressSnapshot, subtotalPaise, discountPaise, deliveryFeePaise, totalPaise } = quote.order;
      return { quoteId: quote.id, policyId: quote.policyId, expiresAt: quote.expiresAt,
        items, currency, fulfillment, addressSnapshot, subtotalPaise, discountPaise, deliveryFeePaise, totalPaise };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('unavailable', 'Quote could not be saved. Retry requesting a quote.');
    }
  };
}
