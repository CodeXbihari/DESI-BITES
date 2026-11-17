import type { AddressSnapshot, CustomerAddress, Entity, Instant, MenuCategory, MenuItem, Order, Shop } from '../../../src/backend/types.ts';
import { id, instant, integer, validateAddressDocument, validateCategory, validateOrder, validateShop } from '../../../src/backend/validation.ts';
import { menuEntity } from '../../../src/backend/firestore/mappers.ts';
import { calculateDemoTotals, safePaise, TEST_ONLY_DEMO_POLICY_V1 } from './demoPricing.ts';
import { validateSubmission, type OrderSubmission } from './submission.ts';

// Server-owned inputs, NEVER deserialized from the customer's request.
// This type does not verify a token; the future callable must do that first.
export interface TrustedQuoteContext {
  customerUid: string;
  shop: Entity<Shop>;
  menuItems: Entity<MenuItem>[];
  categories: Entity<MenuCategory>[];
  savedAddress?: { customerUid: string; address: Entity<CustomerAddress> };
}
export interface TrustedDemoQuote {
  id: string;
  policyId: typeof TEST_ONLY_DEMO_POLICY_V1.id;
  createdAt: Instant;
  expiresAt: Instant;
  consumedOrderId: string | null;
  submission: OrderSubmission;
  // Already priced snapshot. Status and payment are also fixed at confirmation.
  order: Order;
}
export const DEMO_QUOTE_TTL_SECONDS = 300;

function compare(a: Instant, b: Instant): number {
  return a.seconds === b.seconds ? a.nanoseconds - b.nanoseconds : a.seconds - b.seconds;
}

export function buildDemoQuote(raw: unknown, context: TrustedQuoteContext, now: Instant, quoteId: string): TrustedDemoQuote {
  const request = validateSubmission(raw);
  const customerUid = id(context.customerUid);
  id(quoteId); instant(now); validateShop(context.shop.data);
  if (id(context.shop.id) !== request.shopId || !context.shop.data.acceptsOrders
    || !context.shop.data.fulfillmentOptions.includes(request.fulfillment)) throw new Error('Shop cannot accept this order.');
  const menu = new Map<string, MenuItem>();
  for (const item of context.menuItems) {
    const mapped = menuEntity(item.id, item.data);
    if (menu.has(mapped.id)) throw new Error('Duplicate trusted menu ID.');
    menu.set(mapped.id, mapped.data);
  }
  const categories = new Map<string, MenuCategory>();
  for (const category of context.categories) {
    id(category.id); validateCategory(category.data);
    if (categories.has(category.id)) throw new Error('Duplicate trusted category ID.');
    categories.set(category.id, category.data);
  }
  let quantityTotal = 0, subtotal = 0n;
  const items = request.items.map(line => {
    const item = menu.get(line.menuItemId);
    if (!item || !item.published || !item.available || !categories.get(item.categoryId)?.isActive) throw new Error('Menu item is unavailable.');
    quantityTotal += line.quantity;
    if (line.quantity > TEST_ONLY_DEMO_POLICY_V1.maxQuantityPerItem || quantityTotal > TEST_ONLY_DEMO_POLICY_V1.maxTotalQuantity) throw new Error('Demo quantity limit exceeded.');
    const lineTotal = BigInt(item.pricePaise) * BigInt(line.quantity);
    subtotal += lineTotal;
    return { menuItemId: line.menuItemId, nameSnapshot: item.name, imageAssetKey: item.imageAssetKey,
      unitPricePaise: item.pricePaise, quantity: line.quantity, lineTotalPaise: safePaise(lineTotal), menuRevision: item.revision };
  });
  let addressSnapshot: AddressSnapshot | null = null;
  if (request.fulfillment === 'delivery') {
    const saved = context.savedAddress;
    if (!saved || saved.customerUid !== customerUid || saved.address.id !== request.addressId) throw new Error('An owned saved address is required.');
    validateAddressDocument(saved.address.data);
    const { label, addressLine, area, city, pincode, deliveryInstructions } = saved.address.data;
    addressSnapshot = { label, addressLine, area, city, pincode, deliveryInstructions };
  }
  const totals = calculateDemoTotals(safePaise(subtotal), request.fulfillment, request.couponCode);
  const common = { shopId: request.shopId, customerUid, items, currency: 'INR' as const, ...totals,
    status: 'placed' as const, statusVersion: 1, payment: { status: 'unpaid' as const }, createdAt: { ...now }, updatedAt: { ...now } };
  const order: Order = request.fulfillment === 'pickup'
    ? { ...common, fulfillment: 'pickup', addressSnapshot: null }
    : { ...common, fulfillment: 'delivery', addressSnapshot: addressSnapshot! };
  validateOrder(order);
  const expiresAt = { seconds: now.seconds + DEMO_QUOTE_TTL_SECONDS, nanoseconds: now.nanoseconds };
  instant(expiresAt);
  return { id: quoteId, policyId: TEST_ONLY_DEMO_POLICY_V1.id, createdAt: { ...now }, expiresAt, consumedOrderId: null, submission: structuredClone(request), order };
}

// Only call with a quote loaded from server-owned storage, never a client quote.
// No persistence/single-use locking is provided by this pure function.
export function initialOrderFromQuote(quote: TrustedDemoQuote, authenticatedUid: string, now: Instant): Order {
  id(authenticatedUid); id(quote.id); instant(now); instant(quote.createdAt); instant(quote.expiresAt);
  validateOrder(quote.order);
  if (quote.order.customerUid !== authenticatedUid) throw new Error('Quote belongs to another customer.');
  if (quote.policyId !== TEST_ONLY_DEMO_POLICY_V1.id) throw new Error('Unsupported quote policy.');
  if (quote.consumedOrderId !== null) throw new Error('Quote already used.');
  if (compare(quote.expiresAt, quote.createdAt) <= 0 || compare(now, quote.createdAt) < 0 || compare(now, quote.expiresAt) >= 0) throw new Error('Quote expired or has invalid timing.');
  integer(quote.order.statusVersion, 1);
  const order: Order = { ...structuredClone(quote.order), status: 'placed', statusVersion: 1,
    payment: { status: 'unpaid' }, createdAt: { ...now }, updatedAt: { ...now } };
  validateOrder(order);
  return order;
}
