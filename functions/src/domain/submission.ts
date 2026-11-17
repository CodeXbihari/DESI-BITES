import type { Fulfillment } from '../../../src/backend/types.ts';
import { id, integer, record } from '../../../src/backend/validation.ts';

export interface RequestedItem { menuItemId: string; quantity: number }
export type OrderSubmission = {
  shopId: string; items: RequestedItem[]; couponCode: string | null;
} & ({ fulfillment: 'pickup'; addressId: null } | { fulfillment: 'delivery'; addressId: string });

// Transport input contains references only. Identity and monetary/status fields
// must come from the future authenticated handler and trusted database reads.
export function validateSubmission(value: unknown): OrderSubmission {
  const d = record(value);
  const allowed = ['shopId', 'items', 'fulfillment', 'addressId', 'couponCode'];
  if (Object.keys(d).some(key => !allowed.includes(key))) throw new Error('Unexpected submission field.');
  const shopId = id(d.shopId);
  if (!Array.isArray(d.items) || !d.items.length || d.items.length > 100) throw new Error('Expected 1 to 100 distinct items.');
  const seen = new Set<string>();
  const items = d.items.map(value => {
    const line = record(value);
    if (Object.keys(line).length !== 2 || !Object.hasOwn(line, 'menuItemId') || !Object.hasOwn(line, 'quantity')) throw new Error('Unexpected item fields.');
    const menuItemId = id(line.menuItemId);
    integer(line.quantity, 1);
    if (seen.has(menuItemId)) throw new Error('Duplicate menu item.');
    seen.add(menuItemId);
    return { menuItemId, quantity: line.quantity };
  });
  let couponCode: string | null = null;
  if (d.couponCode !== undefined && d.couponCode !== null) {
    if (typeof d.couponCode !== 'string' || d.couponCode.length > 40) throw new Error('Invalid coupon code.');
    couponCode = d.couponCode.trim().toUpperCase() || null;
  }
  const common = { shopId, items, couponCode };
  if (d.fulfillment === 'pickup') {
    if (d.addressId !== undefined && d.addressId !== null) throw new Error('Pickup cannot specify a delivery address.');
    return { ...common, fulfillment: 'pickup', addressId: null };
  }
  if (d.fulfillment !== 'delivery') throw new Error('Unsupported fulfillment.');
  return { ...common, fulfillment: 'delivery', addressId: id(d.addressId) };
}

export interface ConfirmationSubmission { quoteId: string; submissionKey: string }
export function validateConfirmation(value: unknown): ConfirmationSubmission {
  const d = record(value);
  if (Object.keys(d).length !== 2 || !Object.hasOwn(d, 'quoteId') || !Object.hasOwn(d, 'submissionKey')) throw new Error('Unexpected confirmation fields.');
  const submissionKey = id(d.submissionKey);
  if (submissionKey.length < 32) throw new Error('Use a stable random submission key of at least 32 characters.');
  return { quoteId: id(d.quoteId), submissionKey };
}

export function validateFulfillment(value: unknown): Fulfillment {
  if (value !== 'pickup' && value !== 'delivery') throw new Error('Unsupported fulfillment.');
  return value;
}
