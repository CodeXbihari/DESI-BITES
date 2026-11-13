import type { AddressInput, OwnerMenuPatch, ProfileInput } from './types';

export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected an object.');
  return value as Record<string, unknown>;
}
export function exact(value: unknown, keys: readonly string[]): Record<string, unknown> {
  const d = record(value);
  if (Object.keys(d).length !== keys.length || keys.some(k => !Object.hasOwn(d, k))) throw new Error('Unexpected or missing contract fields.');
  return d;
}
export function id(value: unknown): string {
  if (typeof value !== 'string' || value.length < 1 || value.length > 128 || /[^A-Za-z0-9_-]/.test(value)) throw new Error('Invalid document ID.');
  return value;
}
export function text(value: unknown, min: number, max: number): asserts value is string {
  if (typeof value !== 'string' || value.length < min || value.length > max || (min > 0 && !value.trim())) throw new Error('Invalid text field.');
}
export function integer(value: unknown, minimum = 0): asserts value is number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < minimum) throw new Error('Invalid integer field.');
}
export function instant(value: unknown): void {
  const t = record(value);
  integer(t.seconds); integer(t.nanoseconds);
  if ((t.nanoseconds as number) >= 1e9) throw new Error('Invalid timestamp.');
}
export function validateProfile(value: unknown): ProfileInput {
  const d = exact(value, ['displayName', 'defaultAddressId']);
  text(d.displayName, 0, 80);
  if (d.defaultAddressId !== null) id(d.defaultAddressId);
  return { displayName: d.displayName, defaultAddressId: d.defaultAddressId as string | null };
}
export function validateAddress(value: unknown): AddressInput {
  const d = exact(value, ['label', 'addressLine', 'area', 'city', 'pincode', 'deliveryInstructions']);
  if (typeof d.label !== 'string' || !['Home', 'Work', 'Other'].includes(d.label)) throw new Error('Invalid address label.');
  text(d.addressLine, 1, 400); text(d.area, 1, 120); text(d.city, 1, 120); text(d.deliveryInstructions, 0, 500);
  if (typeof d.pincode !== 'string' || !/^[1-9][0-9]{5}$/.test(d.pincode)) throw new Error('Invalid postal code.');
  return { label: d.label as AddressInput['label'], addressLine: d.addressLine, area: d.area, city: d.city, pincode: d.pincode, deliveryInstructions: d.deliveryInstructions };
}
export function validateOwnerMenuPatch(value: unknown): OwnerMenuPatch {
  const d = record(value), keys = Object.keys(d);
  if (!keys.length || keys.some(k => !['pricePaise', 'available'].includes(k))) throw new Error('Protected catalog fields cannot be changed.');
  if (Object.hasOwn(d, 'pricePaise')) integer(d.pricePaise, 1);
  if (Object.hasOwn(d, 'available') && typeof d.available !== 'boolean') throw new Error('Invalid availability.');
  return { ...d } as OwnerMenuPatch;
}

const auditKeys = ['createdAt', 'updatedAt'];
function audit(d: Record<string, unknown>): void { instant(d.createdAt); instant(d.updatedAt); }
export function validateShop(value: unknown): void {
  const d = exact(value, ['name', 'contactEmail', 'currency', 'timezone', 'acceptsOrders', 'fulfillmentOptions', 'menuVersion', ...auditKeys]);
  text(d.name, 1, 200); text(d.contactEmail, 1, 254); audit(d); integer(d.menuVersion, 1);
  if (d.currency !== 'INR' || d.timezone !== 'Asia/Kolkata' || typeof d.acceptsOrders !== 'boolean'
    || !Array.isArray(d.fulfillmentOptions) || !d.fulfillmentOptions.length
    || new Set(d.fulfillmentOptions).size !== d.fulfillmentOptions.length
    || d.fulfillmentOptions.some(x => x !== 'pickup' && x !== 'delivery')) throw new Error('Invalid shop document.');
}
export function validateCategory(value: unknown): void {
  const d = exact(value, ['name', 'sortOrder', 'isActive', 'imageAssetKey', ...auditKeys]);
  text(d.name, 1, 200); text(d.imageAssetKey, 1, 300); integer(d.sortOrder); audit(d);
  if (typeof d.isActive !== 'boolean') throw new Error('Invalid category document.');
}
export function validateProfileDocument(value: unknown): void {
  const d = exact(value, ['displayName', 'defaultAddressId', ...auditKeys]);
  validateProfile({ displayName: d.displayName, defaultAddressId: d.defaultAddressId }); audit(d);
}
export function validateAddressDocument(value: unknown): void {
  const d = exact(value, ['label', 'addressLine', 'area', 'city', 'pincode', 'deliveryInstructions', ...auditKeys]);
  const { createdAt: _created, updatedAt: _updated, ...address } = d;
  validateAddress(address); audit(d);
}
export function validateMembership(value: unknown): void {
  const d = exact(value, ['role', 'active', 'grantedBy', 'grantedAt']);
  id(d.grantedBy); instant(d.grantedAt);
  if (d.role !== 'owner' || typeof d.active !== 'boolean') throw new Error('Invalid membership document.');
}

const statuses = ['placed', 'preparing', 'packed', 'food_ready'];
export function validateOrderStatus(value: unknown): void {
  if (typeof value !== 'string' || !statuses.includes(value)) throw new Error('Unsupported order status.');
}
export function validateOrder(value: unknown): void {
  const d = exact(value, ['shopId', 'customerUid', 'items', 'currency', 'subtotalPaise', 'discountPaise', 'deliveryFeePaise', 'totalPaise', 'status', 'statusVersion', 'payment', 'fulfillment', 'addressSnapshot', 'createdAt', 'updatedAt']);
  id(d.shopId); id(d.customerUid); validateOrderStatus(d.status);
  const payment = exact(d.payment, ['status']);
  if (payment.status !== 'unpaid') throw new Error('Payment status must be unpaid.');
  if (d.currency !== 'INR') throw new Error('Unsupported currency.');
  for (const k of ['subtotalPaise', 'discountPaise', 'deliveryFeePaise', 'totalPaise']) integer(d[k]);
  integer(d.statusVersion, 1); instant(d.createdAt); instant(d.updatedAt);
  if (d.fulfillment === 'pickup') {
    if (d.addressSnapshot !== null || d.deliveryFeePaise !== 0) throw new Error('Pickup cannot include delivery details or fees.');
  } else if (d.fulfillment === 'delivery') validateAddress(d.addressSnapshot);
  else throw new Error('Unsupported fulfillment.');
  if (!Array.isArray(d.items) || !d.items.length || d.items.length > 100) throw new Error('Invalid order items.');
  const seen = new Set<string>(); let subtotal = 0;
  for (const item of d.items) {
    const line = exact(item, ['menuItemId', 'nameSnapshot', 'imageAssetKey', 'unitPricePaise', 'quantity', 'lineTotalPaise', 'menuRevision']);
    const itemId = id(line.menuItemId);
    if (seen.has(itemId)) throw new Error('Duplicate order item.');
    seen.add(itemId); text(line.nameSnapshot, 1, 200); text(line.imageAssetKey, 1, 300);
    for (const k of ['unitPricePaise', 'quantity', 'menuRevision']) integer(line[k], 1);
    integer(line.lineTotalPaise);
    if (line.lineTotalPaise !== (line.unitPricePaise as number) * (line.quantity as number)) throw new Error('Invalid line total.');
    subtotal += line.lineTotalPaise;
  }
  integer(subtotal);
  if (subtotal !== d.subtotalPaise || (d.discountPaise as number) > subtotal
    || d.totalPaise !== subtotal - (d.discountPaise as number) + (d.deliveryFeePaise as number)) throw new Error('Invalid order totals.');
}

export function validateHistory(value: unknown): void {
  const d = exact(value, ['fromStatus', 'toStatus', 'actorUid', 'actorRole', 'statusVersion', 'createdAt']);
  if (d.fromStatus !== null) validateOrderStatus(d.fromStatus);
  validateOrderStatus(d.toStatus); id(d.actorUid); integer(d.statusVersion, 1); instant(d.createdAt);
  if (typeof d.actorRole !== 'string' || !['customer', 'owner', 'system'].includes(d.actorRole)) throw new Error('Invalid actor role.');
}
