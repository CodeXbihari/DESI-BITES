import type { CartItem, CartProduct } from '../types';
import type { CartSubmission } from './customerOrderSession';
export function canClearSubmittedCart(current: CartSubmission, submitted: CartSubmission): boolean {
  return current.uid === submitted.uid && current.version === submitted.version && current.instance === submitted.instance;
}
export function checkoutDraftKey(cart: CartItem[], version: number, fulfillment: string, address: unknown, coupon: string | null): string {
  return JSON.stringify({ items: cart.map(item => [item.product.id, item.quantity]), version, fulfillment, address, coupon });
}
export function mergeReorderItems(cart: CartItem[], additions: { product: CartProduct; quantity: number }[]): CartItem[] {
  let next = [...cart];
  for (const { product, quantity } of additions) {
    if (!Number.isSafeInteger(quantity) || quantity < 1) throw new Error('Invalid reorder quantity.');
    const existing = next.find(item => item.product.id === product.id);
    next = existing ? next.map(item => item.product.id === product.id ? { product, quantity: item.quantity + quantity } : item) : [...next, { product, quantity }];
  }
  return next;
}
