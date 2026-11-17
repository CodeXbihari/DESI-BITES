import type { Entity, Order } from '../backend/types';
import type { Repositories } from '../backend/repositories';
import type { OrderSubmission, ConfirmationSubmission } from '../../functions/src/domain/submission';
import type { TrustedDemoQuote } from '../../functions/src/domain/quote';
import { exact, id, instant, text, validateOrder } from '../backend/validation.ts';

export type QuoteReview = Pick<TrustedDemoQuote, 'policyId' | 'expiresAt'> & { quoteId: string } &
  Pick<Order, 'items' | 'currency' | 'fulfillment' | 'addressSnapshot' | 'subtotalPaise' | 'discountPaise' | 'deliveryFeePaise' | 'totalPaise'>;
export type { OrderSubmission, ConfirmationSubmission };
export interface CustomerOrderApi {
  uid: string;
  quote(input: OrderSubmission): Promise<QuoteReview>;
  confirm(input: ConfirmationSubmission): Promise<Entity<Order>>;
  get(orderId: string): Promise<Entity<Order>>;
  history(afterId?: string): Promise<Entity<Order>[]>;
  newKey(): string;
}
export function validateQuoteReview(value: unknown, uid: string, shopId: string): QuoteReview {
  const q = exact(value, ['quoteId', 'policyId', 'expiresAt', 'items', 'currency', 'fulfillment', 'addressSnapshot', 'subtotalPaise', 'discountPaise', 'deliveryFeePaise', 'totalPaise']);
  id(q.quoteId); text(q.policyId, 1, 100); instant(q.expiresAt);
  const { quoteId: _id, policyId: _policy, expiresAt: _expires, ...snapshot } = q;
  validateOrder({ ...snapshot, customerUid: uid, shopId, status: 'placed', statusVersion: 1,
    payment: { status: 'unpaid' }, createdAt: { seconds: 0, nanoseconds: 0 }, updatedAt: { seconds: 0, nanoseconds: 0 } });
  return structuredClone(q) as unknown as QuoteReview;
}
export function validateCustomerOrder(value: unknown, uid: string): Entity<Order> {
  const entity = exact(value, ['id', 'data']); id(entity.id); validateOrder(entity.data);
  if ((entity.data as Order).customerUid !== uid) throw new Error('Order identity mismatch.');
  return entity as unknown as Entity<Order>;
}
export function createCustomerOrderApi(uid: string, getUid: () => string | null,
  repository: Pick<Repositories, 'kind' | 'orders'>,
  call: (name: 'createCustomerQuote' | 'confirmCustomerOrder' | 'getCustomerOrder', data: unknown) => Promise<unknown>,
  newKey: () => string, shopId = 'demo-desi-bites'): CustomerOrderApi {
  const identity = () => { if (repository.kind !== 'emulator' || getUid() !== uid) throw new Error('An authenticated emulator session is required.'); };
  async function request(name: Parameters<typeof call>[0], data: unknown) { identity(); const result = await call(name, data); identity(); return result; }
  return { uid, newKey,
    async quote(input) { return validateQuoteReview(await request('createCustomerQuote', input), uid, input.shopId); },
    async confirm(input) { return validateCustomerOrder(await request('confirmCustomerOrder', input), uid); },
    async get(orderId) { return validateCustomerOrder(await request('getCustomerOrder', { orderId: id(orderId) }), uid); },
    async history(afterId) {
      identity(); const list = await repository.orders.mine(shopId, { limit: 20, ...(afterId ? { afterId } : {}) }); identity();
      return list.map(item => validateCustomerOrder(item, uid));
    },
  };
}
