export const EMULATOR_PROJECT = 'demo-desiibites-stage1';
export const QUOTES_COLLECTION = 'customerQuotes';

// Called on every invocation before creating/using any Admin client. Exact hosts
// deliberately match firebase.emulators.json; no production endpoint fallback.
export function requireQuoteEmulators(env: NodeJS.ProcessEnv = process.env): void {
  let project: unknown;
  try { project = JSON.parse(env.FIREBASE_CONFIG ?? '{}').projectId; }
  catch { throw new Error('Invalid local Firebase configuration.'); }
  if (env.FUNCTIONS_EMULATOR !== 'true' || env.GCLOUD_PROJECT !== EMULATOR_PROJECT
    || project !== EMULATOR_PROJECT
    || env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080'
    || env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099') {
    throw new Error('Quote callable requires the isolated local emulator suite.');
  }
}
