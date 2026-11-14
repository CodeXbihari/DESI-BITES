const operation = process.argv[2];
const projectId = process.env.FIREBASE_PROJECT_ID;
const phone = process.env.ADMIN_TEST_PHONE;
const demoProjectId = process.env.ADMIN_DEMO_PROJECT_ID;
if (!['grant', 'revoke'].includes(operation) || !projectId) {
  throw new Error('Usage: FIREBASE_PROJECT_ID=<development-project-id> npm run claim -- grant|revoke');
}
if (operation === 'grant' && (
  process.env.NODE_ENV === 'production'
  || process.env.ADMIN_DEMO_ENABLED !== '1'
  || !demoProjectId
  || demoProjectId !== projectId
  || !/^\+91[6-9][0-9]{9}$/.test(phone ?? '')
  || !/^[0-9]{6}$/.test(process.env.ADMIN_TEST_OTP ?? '')
)) {
  throw new Error('Admin demo grant requires local development mode, matching project IDs, phone and six-digit Firebase test code.');
}
if (!phone) throw new Error('ADMIN_TEST_PHONE is required for claim revocation.');

const { applicationDefault, initializeApp } = await import('firebase-admin/app');
const { getAuth } = await import('firebase-admin/auth');
initializeApp({ credential: applicationDefault(), projectId });
const auth = getAuth();
const user = await auth.getUserByPhoneNumber(phone);
const claims = { ...(user.customClaims ?? {}) };
if (operation === 'grant') claims.admin = true;
else delete claims.admin;
await auth.setCustomUserClaims(user.uid, claims);
await auth.revokeRefreshTokens(user.uid);
console.log(`${operation} completed for UID ${user.uid} in ${projectId}. Sign in again to refresh the ID token.`);
