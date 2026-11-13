import { requireNativeStage1, nativeStage1Target, assertNativeStage1Target } from '../config/nativeStage1.ts';
import { assertMatchingProject } from '../config/firebaseTarget.ts';
import { createRepositories } from './createRepositories.ts';
import type { Repositories } from './repositories';
let initialization: Promise<Repositories> | undefined;

// No caller-provided readiness or SDK loader. NativeModules is the only origin.
// This is trusted application wiring, not server-side authentication/authority.
export function bootstrapNativeStage1(): Promise<Repositories> {
  if (!initialization) initialization = (async () => {
    const { NativeModules } = require('react-native') as typeof import('react-native');
    const readiness = requireNativeStage1(NativeModules.DesiiStage1Runtime);
    const target = nativeStage1Target(readiness);
    const { getApp } = require('@react-native-firebase/app') as typeof import('@react-native-firebase/app');
    const app = getApp();
    assertMatchingProject(app.options.projectId, target);
    const { getAuth } = require('@react-native-firebase/auth') as typeof import('@react-native-firebase/auth');
    const auth = getAuth(app);
    const config = auth.emulatorConfig;
    if (config && (config.host !== target.host || config.port !== target.authPort)) throw new Error('Native Auth Emulator target mismatch.');
    const { getFirestore } = require('@react-native-firebase/firestore') as typeof import('@react-native-firebase/firestore');
    const { androidStorePort } = require('./firestore/adapter') as typeof import('./firestore/adapter');
    const port = androidStorePort(auth, getFirestore(app));
    // Native startup has already set persistence and both USB endpoints. Do not
    // reconnect, change settings or invoke RNFB's Android hostname remapping.
    return createRepositories({ authMode: 'firebase', platform: 'android', target }, async validated => {
      assertNativeStage1Target(readiness, validated);
      return port;
    });
  })();
  // Failed setup stays failed until process reload; never switch repositories.
  return initialization;
}
