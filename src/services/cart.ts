import type { CartItem, CartProduct, FulfillmentType } from '../types';

export function addCartItem(cart: CartItem[], product: CartProduct): CartItem[] {
  const existing = cart.find(item => item.product.id === product.id);
  return existing
    ? cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
    : [...cart, { product, quantity: 1 }];
}

export function setCartQuantity(cart: CartItem[], productId: string, quantity: number): CartItem[] {
  if (!Number.isSafeInteger(quantity)) return cart;
  if (quantity <= 0) return cart.filter(item => item.product.id !== productId);
  return cart.map(item => item.product.id === productId ? { ...item, quantity } : item);
}

export function normalizeCoupon(code: string): string | null {
  const coupon = code.trim().toUpperCase();
  return ['FESTIVE40', 'SPICE20', 'DESIEXPRESS'].includes(coupon) ? coupon : null;
}

// Temporary existing pricing policy, pending shop-owner confirmation.
export function calculateCartEstimate(cart: CartItem[], coupon: string | null, fulfillment: FulfillmentType) {
  const subtotalPaise = cart.reduce((sum, item) => sum + Math.round(item.product.price * 100) * item.quantity, 0);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFeePaise = subtotalPaise === 0 || fulfillment === 'pickup' || coupon === 'DESIEXPRESS' || subtotalPaise >= 49900 ? 0 : 3500;
  const percentage = coupon === 'FESTIVE40' ? 40 : coupon === 'SPICE20' ? 20 : 0;
  // Preserve the original whole-rupee discount rounding, expressed in paise.
  const discountPaise = Math.round(subtotalPaise * percentage / 10000) * 100;
  return { count, subtotalPaise, deliveryFeePaise, discountPaise, totalPaise: Math.max(0, subtotalPaise - discountPaise + deliveryFeePaise) };
}

export function canReviewCheckout(cart: CartItem[], fulfillment: FulfillmentType, address: string): boolean {
  return cart.length > 0 && (fulfillment === 'pickup' || address.trim().length > 0);
}
