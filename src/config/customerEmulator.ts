export function customerEmulatorEnabled(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__ && process.env.EXPO_PUBLIC_CUSTOMER_EMULATOR === '1';
}
export const CUSTOMER_EMULATOR_TARGET = Object.freeze({ mode: 'emulator' as const, development: true as const,
  projectId: 'demo-desiibites-stage1', host: '127.0.0.1' as const, authPort: 9099, firestorePort: 8080 });
