import type { Entity } from '../types';

export type Data = Record<string, unknown>;
export interface QuerySpec {
  filters?: Array<[string, string | boolean]>;
  order?: [string, 'asc' | 'desc'];
  limit?: number;
  afterId?: string;
}
export interface TransactionPort {
  get(path: string): Promise<Data | null>;
  set(path: string, value: Data): void;
  update(path: string, value: Data): void;
  delete(path: string): void;
}
// Internal interface, not exposed by createRepositories. SDK writes remain behind
// the typed repository boundary; Firestore Rules independently enforce access.
export interface StorePort {
  uid(): string | null;
  get(path: string): Promise<Data | null>;
  list(path: string, query?: QuerySpec): Promise<Array<Entity<Data>>>;
  serverTimestamp(): unknown;
  transaction<T>(run: (tx: TransactionPort) => Promise<T>): Promise<T>;
}
