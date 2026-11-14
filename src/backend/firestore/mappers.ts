import type { Entity, MenuItem, Order, OrderStatusHistory } from '../types';
import { exact, id, instant, integer, record, text, validateHistory, validateOrder } from '../validation.ts';

// Snapshot data is untrusted even when TypeScript gives it a broad SDK type.
// Convert Timestamp class instances into SDK-independent values.
export function normalize(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(normalize);
  const d = value as Record<string, unknown>;
  if (typeof d.seconds === 'number' && typeof d.nanoseconds === 'number') {
    instant(d); return { seconds: d.seconds, nanoseconds: d.nanoseconds };
  }
  return Object.fromEntries(Object.entries(d).map(([k, v]) => [k, normalize(v)]));
}
export function entity<T>(documentId: string, value: unknown): Entity<T> {
  return { id: id(documentId), data: record(normalize(value)) as T };
}
export function menuEntity(documentId: string, value: unknown): Entity<MenuItem> {
  const result = entity<MenuItem>(documentId, value), d = result.data;
  exact(d, ['name', 'categoryId', 'pricePaise', 'currency', 'imageAssetKey', 'description', 'availabilityNote', 'isVeg', 'available', 'published', 'sortOrder', 'revision', 'createdAt', 'updatedAt']);
  text(d.name, 1, 200); id(d.categoryId); integer(d.pricePaise, 1);
  text(d.imageAssetKey, 1, 300); text(d.description, 0, 2000); text(d.availabilityNote, 0, 500);
  integer(d.sortOrder); integer(d.revision, 1); instant(d.createdAt); instant(d.updatedAt);
  if (d.currency !== 'INR' || ['isVeg', 'available', 'published'].some(k => typeof (d as unknown as Record<string, unknown>)[k] !== 'boolean')) throw new Error('Invalid menu document.');
  return result;
}
export function orderEntity(documentId: string, value: unknown): Entity<Order> {
  const result = entity<Order>(documentId, value); validateOrder(result.data); return result;
}
export function historyEntity(documentId: string, value: unknown): Entity<OrderStatusHistory> {
  const result = entity<OrderStatusHistory>(documentId, value); validateHistory(result.data); return result;
}
