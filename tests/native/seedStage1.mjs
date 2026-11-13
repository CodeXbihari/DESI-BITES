import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, writeBatch } from 'firebase/firestore';
import { pathToFileURL } from 'node:url';
import { fixtureDocuments, membership, profile } from '../emulator/fixtures.mjs';

export function requireStage1SeedEnvironment(env) {
  if (env.GCLOUD_PROJECT !== 'demo-desiibites-stage1'
    || env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099'
    || env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080'
    || (env.GOOGLE_CLOUD_PROJECT && env.GOOGLE_CLOUD_PROJECT !== 'demo-desiibites-stage1')) {
    throw new Error('Seeder requires the exact synthetic demo project and both loopback emulators.');
  }
}

export async function seedStage1(env = process.env) {
  requireStage1SeedEnvironment(env); // Before any network-capable SDK creation.
  const projectId = 'demo-desiibites-stage1';
  // Project-scoped emulator admin endpoints only, never cloud SDK discovery.
  const authRequest = async (operation, body) => {
    const response = await fetch(`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/projects/${projectId}/${operation}`, {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer owner' },
      body: JSON.stringify(body), redirect: 'error', signal: AbortSignal.timeout(5000),
    });
    return { ok: response.ok, body: await response.json() };
  };
  const users = {};
  for (const role of ['customer', 'owner', 'unprivileged']) {
    const uid = `stage1-${role}`;
    const email = `${uid}@example.invalid`;
    const lookup = async () => {
      const r = await authRequest('accounts:lookup', { localId: [uid] });
      if (!r.ok) throw new Error('Synthetic account lookup failed; nothing was reset.');
      return r.body.users?.[0];
    };
    let existing = await lookup();
    if (!existing) {
      const created = await authRequest('accounts', { localId: uid, email, password: 'Stage1_synthetic_only_123!' });
      // A concurrent seed may have created the same fixture. Recheck identity
      // instead of overwriting accounts or changing existing credentials.
      if (created.ok && created.body.localId !== uid) throw new Error('Unexpected synthetic account identity.');
      existing = await lookup();
    }
    if (!existing || existing.localId !== uid || existing.email !== email || existing.disabled === true
      || (existing.customAttributes && existing.customAttributes !== '{}')
      || existing.providerUserInfo?.some(p => p.providerId !== 'password' || p.email !== email)) {
      throw new Error('Conflicting synthetic identity; no account or credential was overwritten.');
    }
    users[role] = uid;
  }
  const test = await initializeTestEnvironment({ projectId, firestore: { host: '127.0.0.1', port: 8080 } });
  try {
    await test.withSecurityRulesDisabled(async context => {
      const db = context.firestore();
      const batch = writeBatch(db);
      for (const [path, data] of fixtureDocuments()) batch.set(doc(db, path), data);
      for (const uid of Object.values(users)) batch.set(doc(db, `users/${uid}`), profile);
      batch.set(doc(db, `shops/shop-a/members/${users.owner}`), membership);
      // Firestore fixtures reset to their documented baseline atomically. Auth
      // account creation is separate: partial Auth progress is retained for retry.
      await batch.commit();
    });
  } finally { await test.cleanup(); }
  console.log('Synthetic customer, owner and unprivileged fixtures seeded in demo-desiibites-stage1 only.');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await seedStage1();
