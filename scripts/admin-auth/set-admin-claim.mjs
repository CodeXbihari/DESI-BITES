import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const operation = process.argv[2];
const projectId = process.env.FIREBASE_PROJECT_ID;
const phone = '+917644940067';
if (!['grant', 'revoke'].includes(operation) || !projectId) {
  throw new Error('Usage: FIREBASE_PROJECT_ID=<development-project-id> npm run claim -- grant|revoke');
}

initializeApp({ credential: applicationDefault(), projectId });
const auth = getAuth();
const user = await auth.getUserByPhoneNumber(phone);
const claims = { ...(user.customClaims ?? {}) };
if (operation === 'grant') claims.admin = true;
else delete claims.admin;
await auth.setCustomUserClaims(user.uid, claims);
await auth.revokeRefreshTokens(user.uid);
console.log(`${operation} completed for UID ${user.uid} in ${projectId}. Sign in again to refresh the ID token.`);
