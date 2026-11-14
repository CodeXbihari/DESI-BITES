// Native implementation. Metro resolves adapter.web.ts on Web. This module is
// intentionally never imported by createRepositories or mock repositories.
import type { FirebaseApp } from '@react-native-firebase/app';
import { connectAuthEmulator, getAuth } from '@react-native-firebase/auth';
import {
  collection, connectFirestoreEmulator, doc, documentId, getDocFromServer,
  getDocsFromServer, getFirestore, initializeFirestore, limit, orderBy, query,
  runTransaction, serverTimestamp, startAfter, where,
} from '@react-native-firebase/firestore';
import type { QueryConstraint } from '@react-native-firebase/firestore';
import type { StorePort } from './adapterTypes';
import type { EmulatorTarget } from '../../config/firebaseTarget';
import { assertMatchingProject, requireEmulatorTarget } from '../../config/firebaseTarget.ts';

const instances = new WeakMap<FirebaseApp, { target: string; port: StorePort }>();

// RN Firebase normally remaps the first two aliases to the Android emulator's
// host-machine address. Compare effective endpoints without changing SDK routing
// or accepting any additional target hosts.
function comparableEmulatorHost(host: string): string {
  return ['localhost', '127.0.0.1', '10.0.2.2'].includes(host) ? '10.0.2.2' : host;
}

// Supply the existing default native app. Call before sign-in/observers on an
// isolated Android test installation, never on a restored production session.
export function createAndroidAdapter(app: FirebaseApp, input: EmulatorTarget): StorePort {
  const target = requireEmulatorTarget(input, 'android');
  assertMatchingProject(app.options.projectId, target);
  // The isolated native build has exactly one bootstrap-owned connection path.
  // It must never enter this ordinary adapter and trigger hostname remapping.
  const { NativeModules } = require('react-native') as typeof import('react-native');
  if (NativeModules.DesiiStage1Runtime != null) throw new Error('Stage 1 requires its native bootstrap entry point.');
  const key = JSON.stringify({ ...target, host: comparableEmulatorHost(target.host) }), existing = instances.get(app);
  if (existing) {
    if (existing.target !== key) throw new Error('Cannot retarget an initialized Firebase app.');
    return existing.port;
  }
  const auth = getAuth(app);
  if (auth.currentUser && !auth.emulatorConfig) throw new Error('Use an isolated Emulator session before signing in.');
  const authConfig = auth.emulatorConfig;
  if (authConfig && (comparableEmulatorHost(authConfig.host) !== comparableEmulatorHost(target.host) || authConfig.port !== target.authPort)) throw new Error('Auth Emulator target mismatch.');
  if (!authConfig) connectAuthEmulator(auth, `http://${target.host}:${target.authPort}`);
  const db = initializeFirestore(app, { persistence: false });
  connectFirestoreEmulator(db, target.host, target.firestorePort);
  const port = androidStorePort(auth, db);
  instances.set(app, { target: key, port });
  return port;
}

// Internal SDK operation mapping, not a connection/readiness API. Both callers
// establish their own guarded connection before wrapping an SDK instance.
export function androidStorePort(auth: ReturnType<typeof getAuth>, db: ReturnType<typeof getFirestore>): StorePort {
  const port: StorePort = {
    uid: () => auth.currentUser?.uid ?? null,
    serverTimestamp,
    async get(path) { const s = await getDocFromServer(doc(db, path)); return s.exists() ? s.data()! : null; },
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
      async get(path) { const s = await tx.get(doc(db, path)); return s.exists() ? s.data()! : null; },
      set: (path, data) => { tx.set(doc(db, path), data); },
      update: (path, data) => { tx.update(doc(db, path), data); },
      delete: path => { tx.delete(doc(db, path)); },
    })),
  };
  return port;
}
