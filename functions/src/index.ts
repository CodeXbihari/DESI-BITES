import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { Timestamp } from 'firebase-admin/firestore';
import { getEmulatorFirestore, getEmulatorQuoteStore } from './adminQuoteStore.ts';
import { adminOrderStore } from './adminOrderStore.ts';
import { createConfirmationHandler, createOrderLookupHandler } from './orderService.ts';
import { requireQuoteEmulators } from './emulatorOnly.ts';
import { createQuoteHandler } from './quoteService.ts';

export const createCustomerQuote = onCall({ region: 'us-central1' }, async request => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in to request a quote.');
  // Lazy initialization allows CLI discovery without opening any database.
  // Invocation outside the explicit local suite fails closed before Admin use.
  try { requireQuoteEmulators(); }
  catch { throw new HttpsError('failed-precondition', 'This test endpoint is available only in the local emulator suite.'); }
  const handler = createQuoteHandler(getEmulatorQuoteStore(), () => {
    const time = Timestamp.now();
    return { seconds: time.seconds, nanoseconds: time.nanoseconds };
  });
  return handler(request);
});

function orderStoreForRequest(auth: unknown) {
  if (!auth) throw new HttpsError('unauthenticated', 'Sign in to access orders.');
  try { requireQuoteEmulators(); }
  catch { throw new HttpsError('failed-precondition', 'Orders are available only in the local emulator suite.'); }
  return adminOrderStore(getEmulatorFirestore());
}
export const confirmCustomerOrder = onCall({ region: 'us-central1' }, async request => {
  const store = orderStoreForRequest(request.auth);
  return createConfirmationHandler(store, () => {
    const time = Timestamp.now();
    return { seconds: time.seconds, nanoseconds: time.nanoseconds };
  })(request);
});
export const getCustomerOrder = onCall({ region: 'us-central1' }, request =>
  createOrderLookupHandler(orderStoreForRequest(request.auth))(request));
