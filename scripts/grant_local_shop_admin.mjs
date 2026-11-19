import { createRequire } from 'node:module';
const projectId = 'demo-desiibites-stage1';
if (process.env.GCLOUD_PROJECT !== projectId || process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080'
  || process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099') throw new Error('Explicit loopback demo emulators are required.');
const args = process.argv.slice(2);
if (args.length !== 4 || args[0] !== '--uid' || args[2] !== '--shop' || !args.every((value, n) => n % 2 === 0 || /^[A-Za-z0-9_-]{1,128}$/.test(value))) throw new Error('Usage: --uid EXISTING_EMULATOR_UID --shop EXISTING_SHOP_ID');
const require = createRequire(new URL('../functions/package.json', import.meta.url));
const { initializeApp, deleteApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const app = initializeApp({ projectId }, 'local-shop-admin-provisioning'), db = getFirestore(app);
try {
  const uid = args[1], shopId = args[3]; await getAuth(app).getUser(uid);
  const shop = await db.doc(`shops/${shopId}`).get(); if (!shop.exists) throw new Error('Existing local shop required.');
  await db.doc(`shops/${shopId}/members/${uid}`).create({ role: 'owner', active: true, grantedBy: 'local-emulator-operator', grantedAt: Timestamp.now() });
  console.log(`Provisioned existing emulator UID ${uid} as shop owner/admin for ${shopId}. No production access.`);
} finally { await db.terminate(); await deleteApp(app); }
