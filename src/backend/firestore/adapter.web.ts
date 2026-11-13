import type { FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import {
  collection, connectFirestoreEmulator, doc, documentId,
  getDocFromServer, getDocsFromServer, initializeFirestore, limit,
  memoryLocalCache, orderBy, query, runTransaction, serverTimestamp,
  startAfter, where,
} from 'firebase/firestore';
import type { QueryConstraint } from 'firebase/firestore';
import type { StorePort } from './adapterTypes';
import type { EmulatorTarget } from '../../config/firebaseTarget';
import { assertMatchingProject, requireEmulatorTarget } from '../../config/firebaseTarget.ts';

const instances = new WeakMap<FirebaseApp, { target: string; port: StorePort }>();

// Invoke once, before Auth observers/requests or Firestore operations. The app
// is supplied by the caller; it is the same app used by Firebase Auth.
export function createWebAdapter(app: FirebaseApp, input: EmulatorTarget): StorePort {
  const target = requireEmulatorTarget(input, 'web');
  assertMatchingProject(app.options.projectId, target);
  const key = JSON.stringify(target), existing = instances.get(app);
  if (existing) {
    if (existing.target !== key) throw new Error('Cannot retarget an initialized Firebase app.');
    return existing.port;
  }
  const auth = getAuth(app);
  if (auth.currentUser && !auth.emulatorConfig) throw new Error('Use an isolated Emulator session before signing in.');
  const authConfig = auth.emulatorConfig;
  if (authConfig && (authConfig.host !== target.host || authConfig.port !== target.authPort)) throw new Error('Auth Emulator target mismatch.');
  if (!authConfig) connectAuthEmulator(auth, `http://${target.host}:${target.authPort}`, { disableWarnings: true });
  const db = initializeFirestore(app, { localCache: memoryLocalCache() });
  connectFirestoreEmulator(db, target.host, target.firestorePort);
  const port: StorePort = {
    uid: () => auth.currentUser?.uid ?? null,
    serverTimestamp,
    async get(path) { const s = await getDocFromServer(doc(db, path)); return s.exists() ? s.data() : null; },
    async list(path, spec = {}) {
      const constraints: QueryConstraint[] = (spec.filters ?? []).map(([k, v]) => where(k, '==', v));
      if (spec.order) constraints.push(orderBy(...spec.order));
      constraints.push(orderBy(documentId()));
      if (spec.afterId) {
        const cursor = await getDocFromServer(doc(db, path, spec.afterId));
        if (!cursor.exists()) throw new Error('Missing pagination cursor.');
        constraints.push(startAfter(cursor));
      }
      constraints.push(limit(spec.limit ?? 100));
      const result = await getDocsFromServer(query(collection(db, path), ...constraints));
      return result.docs.map(s => ({ id: s.id, data: s.data() }));
    },
    transaction: run => runTransaction(db, tx => run({
      async get(path) { const s = await tx.get(doc(db, path)); return s.exists() ? s.data() : null; },
      set: (path, data) => { tx.set(doc(db, path), data); },
      update: (path, data) => { tx.update(doc(db, path), data); },
      delete: path => { tx.delete(doc(db, path)); },
    })),
  };
  instances.set(app, { target: key, port });
  return port;
}
