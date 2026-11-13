import type { Data, StorePort, TransactionPort } from './firestore/adapterTypes';
import { buildRepositories } from './firestore/repositories.ts';
import { id } from './validation.ts';

// A new private in-memory store per factory call. No SDK imports or network code.
// This is demonstration state, not a simulation of production authorization.
export function createDemoRepositories(demoUid = 'demo-customer') {
  id(demoUid);
  const documents = new Map<string, Data>();
  const copy = <T>(v: T): T => structuredClone(v);
  const port: StorePort = {
    uid: () => demoUid,
    serverTimestamp: () => ({ seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 }),
    get: async path => copy(documents.get(path) ?? null),
    async list(path, query = {}) {
      let result = [...documents].filter(([p]) => p.startsWith(`${path}/`) && p.split('/').length === path.split('/').length + 1)
        .map(([p, data]) => ({ id: p.split('/').at(-1)!, data: copy(data) }));
      for (const [field, expected] of query.filters ?? []) result = result.filter(x => x.data[field] === expected);
      if (query.order) {
        const [field, direction] = query.order;
        result.sort((a, b) => String(a.data[field]).localeCompare(String(b.data[field])) * (direction === 'asc' ? 1 : -1));
      }
      if (query.afterId) { const index = result.findIndex(x => x.id === query.afterId); if (index < 0) throw new Error('Missing cursor.'); result = result.slice(index + 1); }
      return result.slice(0, query.limit ?? result.length);
    },
    async transaction(run) {
      const staged = new Map(documents);
      const tx: TransactionPort = {
        get: async p => copy(staged.get(p) ?? null),
        set: (p, d) => { staged.set(p, copy(d)); },
        update: (p, d) => { if (!staged.has(p)) throw new Error('Missing document.'); staged.set(p, { ...staged.get(p), ...copy(d) }); },
        delete: p => { staged.delete(p); },
      };
      const value = await run(tx);
      documents.clear(); for (const [p, d] of staged) documents.set(p, d);
      return value;
    },
  };
  return buildRepositories(port, 'demo');
}
