import { Timestamp } from 'firebase-admin/firestore';
import type { Firestore } from 'firebase-admin/firestore';
import { normalize } from '../../src/backend/firestore/mappers.ts';
import type { Instant } from '../../src/backend/types.ts';
import { QUOTES_COLLECTION } from './emulatorOnly.ts';
import { SUBMISSIONS_COLLECTION, type OrderStore } from './orderService.ts';

export function adminOrderStore(db: Firestore): OrderStore {
  const time = (value: Instant) => new Timestamp(value.seconds, value.nanoseconds);
  return {
    newOrderId: () => db.collection('orders').doc().id,
    async getOrder(orderId) {
      const doc = await db.doc(`orders/${orderId}`).get();
      return doc.exists ? normalize(doc.data()) : null;
    },
    transaction: run => db.runTransaction(async tx => run({
      async get(path) {
        const doc = await tx.get(db.doc(path));
        return doc.exists ? normalize(doc.data()) : null;
      },
      createOrder(orderId, order) {
        tx.create(db.doc(`orders/${orderId}`), { ...order, createdAt: time(order.createdAt), updatedAt: time(order.updatedAt) });
      },
      createHistory(orderId, history) {
        tx.create(db.doc(`orders/${orderId}/statusHistory/initial`), { ...history, createdAt: time(history.createdAt) });
      },
      consumeQuote(quoteId, orderId) { tx.update(db.doc(`${QUOTES_COLLECTION}/${quoteId}`), { consumedOrderId: orderId }); },
      createReceipt(receiptId, receipt) {
        tx.create(db.doc(`${SUBMISSIONS_COLLECTION}/${receiptId}`), { ...receipt, createdAt: time(receipt.createdAt) });
      },
    })),
  };
}
