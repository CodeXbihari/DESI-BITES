import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { catalogMenuSeed } from '../src/services/customerMenu.ts';

// Explicit test data only; never discovers a cloud/default project or overwrites
// an existing document. A batch create fails atomically if any ID already exists.
const projectId = 'demo-desiibites-stage1';
if (process.env.GCLOUD_PROJECT !== projectId || process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080'
  || process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099') throw new Error('Explicit local demo emulators are required.');
const require = createRequire(new URL('../functions/package.json', import.meta.url));
const { initializeApp, deleteApp } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const app = initializeApp({ projectId }, 'seed-customer-emulator');
const db = getFirestore(app);
try {
  const catalog = JSON.parse(readFileSync(new URL('../src/data/restaurantMenu.json', import.meta.url), 'utf8'));
  const seed = catalogMenuSeed(catalog), batch = db.batch(), now = Timestamp.now();
  const shop = db.doc(`shops/${seed.shopId}`);
  batch.create(shop, { name: 'Desi Bytes local test shop', contactEmail: 'test@example.invalid', currency: 'INR', timezone: 'Asia/Kolkata',
    acceptsOrders: true, fulfillmentOptions: ['pickup', 'delivery'], menuVersion: 1, createdAt: now, updatedAt: now });
  for (const [collection, items] of [['menuItems', seed.items], ['menuCategories', seed.categories]]) {
    for (const item of items) batch.create(shop.collection(collection).doc(item.id), { ...item.data, createdAt: now, updatedAt: now });
  }
  await batch.commit();
  console.log(`Created ${seed.items.length} menu items and ${seed.categories.length} categories in ${projectId}/${seed.shopId}. No orders or payments seeded.`);
} finally { await db.terminate(); await deleteApp(app); }
