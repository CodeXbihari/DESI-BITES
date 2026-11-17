import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { Firestore } from 'firebase-admin/firestore';
import { normalize } from '../../src/backend/firestore/mappers.ts';
import { EMULATOR_PROJECT, QUOTES_COLLECTION, requireQuoteEmulators } from './emulatorOnly.ts';
import type { QuoteStore } from './quoteService.ts';

export function adminQuoteStore(db: Firestore): QuoteStore {
  return {
    newQuoteId: () => db.collection(QUOTES_COLLECTION).doc().id,
    transaction: run => db.runTransaction(async tx => run({
      async get(path) {
        const snapshot = await tx.get(db.doc(path));
        return snapshot.exists ? normalize(snapshot.data()) : null;
      },
      createQuote(quote) {
        const timestamp = (value: { seconds: number; nanoseconds: number }) => new Timestamp(value.seconds, value.nanoseconds);
        // New server-only schema; nested order is a quote snapshot, not an order
        // document. No writes to orders, history, receipts or payments exist here.
        tx.create(db.collection(QUOTES_COLLECTION).doc(quote.id), {
          ...quote, customerUid: quote.order.customerUid, shopId: quote.order.shopId,
          createdAt: timestamp(quote.createdAt), expiresAt: timestamp(quote.expiresAt),
          order: { ...quote.order, createdAt: timestamp(quote.order.createdAt), updatedAt: timestamp(quote.order.updatedAt) },
        });
      },
    })),
  };
}

let store: QuoteStore | undefined;
export function getEmulatorFirestore(): Firestore {
  requireQuoteEmulators();
  const name = 'stage4-quotes-emulator-only';
  const app = getApps().find(app => app.name === name) ?? initializeApp({
    projectId: EMULATOR_PROJECT,
    // Standard Admin initialization. The validated FIRESTORE_EMULATOR_HOST
    // selects insecure loopback transport and the SDK's emulator-only auth;
    // no service account or production token is needed for Firestore requests.
  }, name);
  if (app.options.projectId !== EMULATOR_PROJECT) throw new Error('Emulator Admin project mismatch.');
  return getFirestore(app);
}

export function getEmulatorQuoteStore(): QuoteStore {
  requireQuoteEmulators();
  return store ??= adminQuoteStore(getEmulatorFirestore());
}
