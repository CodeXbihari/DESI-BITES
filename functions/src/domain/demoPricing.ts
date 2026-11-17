import type { Fulfillment } from '../../../src/backend/types.ts';
import { integer } from '../../../src/backend/validation.ts';
import { validateFulfillment } from './submission.ts';

// TEST ONLY. Mirrors src/services/cart.ts, not confirmed restaurant policy.
// Limits are provisional test safeguards, not existing restaurant rules.
export const TEST_ONLY_DEMO_POLICY_V1 = Object.freeze({
  id: 'test-only-demo-v1', currency: 'INR' as const,
  deliveryFeePaise: 3500, freeDeliveryAtSubtotalPaise: 49900,
  maxQuantityPerItem: 99, maxTotalQuantity: 500,
  couponPercentages: Object.freeze({ FESTIVE40: 40, SPICE20: 20 }),
  freeDeliveryCoupon: 'DESIEXPRESS',
});

export function safePaise(value: bigint): number {
  if (value < 0n || value > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('Amount exceeds safe integer paise.');
  return Number(value);
}

export function calculateDemoTotals(subtotalPaise: number, fulfillment: Fulfillment, couponCode: string | null) {
  integer(subtotalPaise);
  validateFulfillment(fulfillment);
  const p = TEST_ONLY_DEMO_POLICY_V1;
  if (couponCode !== null && !Object.hasOwn(p.couponPercentages, couponCode) && couponCode !== p.freeDeliveryCoupon) throw new Error('Unsupported demo coupon.');
  const percentage = couponCode && Object.hasOwn(p.couponPercentages, couponCode)
    ? p.couponPercentages[couponCode as keyof typeof p.couponPercentages] : 0;
  // Original Math.round(subtotalPaise * percentage / 10000) * 100:
  // round discount to a whole rupee, with exact integer intermediate math.
  const discountPaise = safePaise(((BigInt(subtotalPaise) * BigInt(percentage) + 5000n) / 10000n) * 100n);
  if (discountPaise > subtotalPaise) throw new Error('Demo rounding exceeds subtotal.');
  const deliveryFeePaise = subtotalPaise === 0 || fulfillment === 'pickup'
    || couponCode === p.freeDeliveryCoupon || subtotalPaise >= p.freeDeliveryAtSubtotalPaise ? 0 : p.deliveryFeePaise;
  const totalPaise = safePaise(BigInt(subtotalPaise) - BigInt(discountPaise) + BigInt(deliveryFeePaise));
  return { subtotalPaise, discountPaise, deliveryFeePaise, totalPaise };
}
