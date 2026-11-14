import { assertMatchingProject, requireEmulatorTarget } from './firebaseTarget.ts';
import type { EmulatorTarget } from './firebaseTarget';

export interface NativeStage1Readiness {
  version: 1;
  ready: true;
  applicationId: 'com.desi.app.stage1';
  projectId: 'demo-desiibites-stage1';
  transport: 'usb';
  host: '127.0.0.1';
  authPort: 9099;
  firestorePort: 8080;
  authConnected: true;
  firestoreConnected: true;
}

// Only the dedicated native root uses this contract. An environment variable
// cannot select it or substitute for the native startup module.
export function requireNativeStage1(value: unknown): Readonly<NativeStage1Readiness> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Stage 1 native readiness is missing.');
  const d = value as Record<string, unknown>;
  if (d.version !== 1 || d.ready !== true || d.applicationId !== 'com.desi.app.stage1'
    || d.projectId !== 'demo-desiibites-stage1' || d.transport !== 'usb'
    || d.host !== '127.0.0.1' || d.authPort !== 9099 || d.firestorePort !== 8080
    || d.authConnected !== true || d.firestoreConnected !== true) {
    throw new Error('Stage 1 native identity, readiness or endpoints are invalid.');
  }
  requireEmulatorTarget({ ...d, mode: 'emulator', development: true }, 'android');
  return Object.freeze({ version: 1, ready: true, applicationId: d.applicationId,
    projectId: d.projectId, transport: d.transport, host: d.host, authPort: d.authPort,
    firestorePort: d.firestorePort, authConnected: true, firestoreConnected: true });
}

export function nativeStage1Target(value: unknown): EmulatorTarget {
  const d = requireNativeStage1(value);
  return requireEmulatorTarget({ mode: 'emulator', development: true, projectId: d.projectId,
    host: d.host, authPort: d.authPort, firestorePort: d.firestorePort }, 'android');
}

export function assertNativeStage1Target(value: unknown, target: EmulatorTarget): void {
  const native = nativeStage1Target(value);
  assertMatchingProject(native.projectId, target);
  if (target.host !== native.host || target.authPort !== native.authPort || target.firestorePort !== native.firestorePort) {
    throw new Error('Stage 1 native Emulator target mismatch.');
  }
}
