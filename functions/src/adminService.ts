import { HttpsError } from 'firebase-functions/v2/https';
import { Timestamp } from 'firebase-admin/firestore';
import type { Firestore, Transaction } from 'firebase-admin/firestore';
import type { Entity, Order, OrderStatus, Instant } from '../../src/backend/types.ts';
import { exact, record, id, integer, instant, text, validateCategory, validateHistory, validateMembership, validateOrder, validateShop } from '../../src/backend/validation.ts';
import { normalize, menuEntity } from '../../src/backend/firestore/mappers.ts';
import type { QuoteRequest } from './quoteService.ts';

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = { placed: 'preparing', preparing: 'packed', packed: 'food_ready' };
export function validateAdminTransition(from: OrderStatus, to: unknown): OrderStatus {
  if (NEXT[from] !== to) throw new HttpsError('failed-precondition', 'Only the next kitchen status is permitted.');
  return to as OrderStatus;
}
export function validateAdminMenuPatch(value: unknown) {
  const patch = record(value), keys = Object.keys(patch);
  if (!keys.length || keys.some(key => !['name', 'description', 'pricePaise', 'available', 'isVeg', 'availabilityNote', 'categoryId'].includes(key))) throw new Error('Protected menu fields cannot be changed.');
  if ('name' in patch) text(patch.name, 1, 200);
  if ('description' in patch) text(patch.description, 0, 2000);
  if ('availabilityNote' in patch) text(patch.availabilityNote, 0, 500);
  if ('pricePaise' in patch) integer(patch.pricePaise, 1);
  if ('categoryId' in patch) id(patch.categoryId);
  for (const key of ['available', 'isVeg']) if (key in patch && typeof patch[key] !== 'boolean') throw new Error('Invalid menu boolean.');
  return patch;
}
function snapshot(doc: { id: string; data(): unknown }) { return { id: doc.id, data: normalize(doc.data()) }; }
function conflict(): never { throw new HttpsError('aborted', 'Data changed. Refresh before trying again.'); }
function sameTime(a: unknown, b: unknown) { instant(a); instant(b); return (a as Instant).seconds === (b as Instant).seconds && (a as Instant).nanoseconds === (b as Instant).nanoseconds; }

export function createAdminHandler(db: Firestore, customer: (uid: string) => Promise<{ displayName?: string | null; phoneNumber?: string | null }>) {
  return async (request: QuoteRequest): Promise<unknown> => {
    if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Sign in to access shop management.');
    let input: Record<string, unknown>, uid: string, shopId: string, op: string;
    try {
      input = record(request.data); uid = id(request.auth.uid); shopId = id(input.shopId);
      text(input.op, 1, 40); op = input.op;
    } catch { throw new HttpsError('invalid-argument', 'Invalid shop request.'); }
    const shopPath = `shops/${shopId}`, member = db.doc(`${shopPath}/members/${uid}`);
    async function authorize(tx?: Transaction) {
      const doc = tx ? await tx.get(member) : await member.get();
      if (!doc.exists) throw new HttpsError('permission-denied', 'Active shop administrator membership is required.');
      const data = normalize(doc.data()) as { role: string; active: boolean };
      try { validateMembership(data); }
      catch { throw new HttpsError('permission-denied', 'Active shop administrator membership is required.'); }
      if (data.role !== 'owner' || data.active !== true) throw new HttpsError('permission-denied', 'Active shop administrator membership is required.');
    }
    try {
      // Authorization precedes every read, including bootstrap and aggregation.
      await authorize();
      if (op === 'access') {
        exact(input, ['op', 'shopId']);
        const shop = await db.doc(shopPath).get(); if (!shop.exists) throw new HttpsError('not-found', 'Shop not found.');
        const data = normalize(shop.data()); validateShop(data); await authorize();
        return { shop: { id: shopId, data }, role: 'owner', uid };
      }
      if (op === 'bootstrap') {
        exact(input, ['op', 'shopId', 'period']);
        if (!['all', 'today', 'week', 'month'].includes(input.period as string)) throw new Error('Invalid period.');
        const [shop, menu, categories] = await Promise.all([db.doc(shopPath).get(), db.collection(`${shopPath}/menuItems`).orderBy('sortOrder').get(), db.collection(`${shopPath}/menuCategories`).orderBy('sortOrder').get()]);
        if (!shop.exists) throw new HttpsError('not-found', 'Shop not found.');
        validateShop(normalize(shop.data()));
        let query = db.collection('orders').where('shopId', '==', shopId);
        if (input.period !== 'all') {
          const local = new Date(Date.now() + 19800000);
          let start = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - 19800000;
          if (input.period === 'week') start -= ((local.getUTCDay() + 6) % 7) * 86400000;
          if (input.period === 'month') start = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) - 19800000;
          query = query.where('createdAt', '>=', Timestamp.fromMillis(start)).where('createdAt', '<=', Timestamp.now());
        }
        const statuses = ['placed', 'preparing', 'packed', 'food_ready'];
        const counts = await Promise.all([query.count().get(), ...statuses.map(status => query.where('status', '==', status).count().get())]);
        const items = menu.docs.map(doc => menuEntity(doc.id, normalize(doc.data())));
        const cats = categories.docs.map(doc => { const value = snapshot(doc); validateCategory(value.data); return value; });
        await authorize();
        return { shop: snapshot(shop), menu: items, categories: cats, period: input.period,
          counts: Object.fromEntries(['total', ...statuses].map((key, n) => [key, counts[n].data().count])) };
      }
      if (op === 'orders') {
        exact(input, ['op', 'shopId', 'status', 'afterId']);
        if (!['all', 'placed', 'preparing', 'packed', 'food_ready'].includes(input.status as string)) throw new Error('Invalid status.');
        let query = db.collection('orders').where('shopId', '==', shopId).orderBy('createdAt', 'desc').orderBy('__name__');
        if (input.status !== 'all') query = query.where('status', '==', input.status);
        if (input.afterId !== null) {
          const cursor = await db.doc(`orders/${id(input.afterId)}`).get();
          if (!cursor.exists || cursor.data()?.shopId !== shopId) throw new HttpsError('invalid-argument', 'Invalid order cursor.');
          query = query.startAfter(cursor);
        }
        const docs = await query.limit(20).get();
        const orders = docs.docs.map(doc => { const value = snapshot(doc); validateOrder(value.data); return value; });
        const customers = await Promise.all([...new Set(orders.map(item => (item.data as Order).customerUid))].map(async customerUid => {
          const profile = await db.doc(`users/${customerUid}`).get();
          return { uid: customerUid, displayName: typeof profile.data()?.displayName === 'string' ? profile.data()!.displayName : null };
        }));
        await authorize(); return { orders, customers, more: docs.size === 20 };
      }
      if (op === 'customerOrders') {
        exact(input, ['op', 'shopId', 'customerUid', 'afterId']);
        const customerUid = id(input.customerUid);
        let query = db.collection('orders').where('shopId', '==', shopId).where('customerUid', '==', customerUid)
          .orderBy('createdAt', 'desc').orderBy('__name__');
        if (input.afterId !== null) {
          const cursor = await db.doc(`orders/${id(input.afterId)}`).get();
          if (!cursor.exists || cursor.data()?.shopId !== shopId || cursor.data()?.customerUid !== customerUid) throw new HttpsError('invalid-argument', 'Invalid order cursor.');
          query = query.startAfter(cursor);
        }
        const docs = await query.limit(20).get();
        const orders = docs.docs.map(doc => { const value = snapshot(doc); validateOrder(value.data); return value; });
        await authorize(); return { orders, more: docs.size === 20 };
      }
      if (op === 'order') {
        exact(input, ['op', 'shopId', 'orderId', 'historyAfter']);
        const orderId = id(input.orderId), order = await db.doc(`orders/${orderId}`).get();
        if (!order.exists || order.data()?.shopId !== shopId) throw new HttpsError('not-found', 'Order not found in this shop.');
        const entity = snapshot(order); validateOrder(entity.data);
        let query = order.ref.collection('statusHistory').orderBy('statusVersion');
        if (input.historyAfter !== null) { integer(input.historyAfter, 1); query = query.where('statusVersion', '>', input.historyAfter); }
        const events = await query.limit(50).get();
        const history = events.docs.map(doc => { const value = snapshot(doc); validateHistory(value.data); return value; });
        const data = entity.data as Order, profile = await db.doc(`users/${data.customerUid}`).get();
        let identity: { displayName?: string | null; phoneNumber?: string | null } = {};
        try { identity = await customer(data.customerUid); } catch (error) {
          if ((error as { code?: string }).code !== 'auth/user-not-found') throw error;
        }
        await authorize();
        return { order: entity, history, more: events.size === 50, customer: { uid: data.customerUid,
          displayName: profile.data()?.displayName ?? identity.displayName ?? null, phoneNumber: identity.phoneNumber ?? null } };
      }
      if (op === 'status') {
        exact(input, ['op', 'shopId', 'orderId', 'expectedVersion', 'status']);
        const orderId = id(input.orderId); integer(input.expectedVersion, 1);
        if (!['preparing', 'packed', 'food_ready'].includes(input.status as string)) throw new Error('Invalid target status.');
        const expected = input.expectedVersion, toStatus = input.status as OrderStatus; integer(expected + 1, 1);
        return await db.runTransaction(async tx => {
          await authorize(tx);
          const ref = db.doc(`orders/${orderId}`), event = ref.collection('statusHistory').doc(`version-${expected + 1}`);
          const [doc, previousEvent] = await Promise.all([tx.get(ref), tx.get(event)]);
          if (!doc.exists || doc.data()?.shopId !== shopId) throw new HttpsError('not-found', 'Order not found in this shop.');
          const order = normalize(doc.data()) as Order; validateOrder(order);
          if (previousEvent.exists) {
            const history = normalize(previousEvent.data()) as { actorUid: string; toStatus: string; statusVersion: number }; validateHistory(history);
            if (history.actorUid === uid && history.toStatus === toStatus && history.statusVersion === expected + 1) return { order: snapshot(doc), alreadyApplied: true };
            conflict();
          }
          if (order.statusVersion !== expected) conflict();
          validateAdminTransition(order.status, toStatus);
          const now = Timestamp.now();
          tx.update(ref, { status: toStatus, statusVersion: expected + 1, updatedAt: now });
          tx.create(event, { fromStatus: order.status, toStatus, actorUid: uid, actorRole: 'owner', statusVersion: expected + 1, createdAt: now });
          return { order: { id: orderId, data: { ...order, status: toStatus, statusVersion: expected + 1, updatedAt: normalize(now) } }, alreadyApplied: false };
        });
      }
      if (op === 'menu' || op === 'category' || op === 'shop') {
        if (op === 'menu') exact(input, ['op', 'shopId', 'itemId', 'expectedRevision', 'patch']);
        else if (op === 'category') exact(input, ['op', 'shopId', 'categoryId', 'expectedUpdatedAt', 'patch']);
        else exact(input, ['op', 'shopId', 'expectedUpdatedAt', 'patch']);
        const patch = op === 'menu' ? validateAdminMenuPatch(input.patch) : record(input.patch);
        if (op === 'menu') integer(input.expectedRevision, 1);
        if (op === 'category') {
          if (!Object.keys(patch).length || Object.keys(patch).some(key => !['name', 'isActive'].includes(key))) throw new Error('Unsupported category edit.');
          if ('name' in patch) text(patch.name, 1, 120);
          if ('isActive' in patch && typeof patch.isActive !== 'boolean') throw new Error('Invalid category state.');
        }
        if (op === 'shop') { exact(patch, ['acceptsOrders']); if (typeof patch.acceptsOrders !== 'boolean') throw new Error('Invalid shop state.'); }
        if (op !== 'menu') instant(input.expectedUpdatedAt);
        return await db.runTransaction(async tx => {
          await authorize(tx);
          const shopRef = db.doc(shopPath), shopDoc = await tx.get(shopRef);
          if (!shopDoc.exists) throw new HttpsError('not-found', 'Shop not found.');
          const shop = normalize(shopDoc.data()) as { menuVersion: number; updatedAt: Instant }; validateShop(shop);
          const ref = op === 'shop' ? shopRef : db.doc(`${shopPath}/${op === 'menu' ? 'menuItems' : 'menuCategories'}/${id(op === 'menu' ? input.itemId : input.categoryId)}`);
          const doc = op === 'shop' ? shopDoc : await tx.get(ref);
          if (!doc.exists) throw new HttpsError('not-found', 'Existing catalog record required.');
          const current = normalize(doc.data()) as Record<string, unknown>;
          if (op === 'menu') {
            menuEntity(doc.id, current);
            if (current.revision !== input.expectedRevision) conflict();
            if ('categoryId' in patch) {
              const category = await tx.get(db.doc(`${shopPath}/menuCategories/${id(patch.categoryId)}`));
              if (!category.exists) throw new HttpsError('failed-precondition', 'Choose an existing shop category.');
              validateCategory(normalize(category.data()));
            }
          } else { if (op === 'category') validateCategory(current); if (!sameTime(current.updatedAt, input.expectedUpdatedAt)) conflict(); }
          if (op === 'menu') integer((current.revision as number) + 1, 1);
          integer(shop.menuVersion + 1, 1);
          const changed = { ...patch, ...(op === 'menu' ? { revision: (current.revision as number) + 1 } : {}), updatedAt: Timestamp.now() };
          tx.update(ref, changed);
          if (op !== 'shop') tx.update(shopRef, { menuVersion: shop.menuVersion + 1, updatedAt: changed.updatedAt });
          return { id: doc.id, data: normalize({ ...current, ...changed }) };
        });
      }
      throw new HttpsError('invalid-argument', 'Unknown administrator operation.');
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      // Request validation errors remain distinct from transient SDK failures.
      if (!(error as { code?: unknown }).code) throw new HttpsError('invalid-argument', (error as Error).message);
      throw new HttpsError('unavailable', 'Shop management request failed. Refresh and retry.');
    }
  };
}
