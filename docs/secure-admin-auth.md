# Secure Admin authentication setup

The Admin entry is separate from Customer navigation. Web: open `/admin/login` on the Expo Web server. Native development build: open `desibites:///admin/login`. A direct dashboard URL always enters the same Firebase claim guard.

## Development Firebase setup

1. Use the existing Firebase project's development environment. Enable Phone Authentication and add `+917644940067` with test code `022007` under Firebase Authentication test phone numbers. The app does not contain or compare this code. Firebase must verify it.
2. Set the existing Web `EXPO_PUBLIC_FIREBASE_*` values in project-root `.env`. Add the Android and iOS Firebase client files through the paths in `.env.example`; build native development clients. Expo Go cannot load native Firebase Phone Auth.
3. Set `ADMIN_DEMO_ENABLED=1`, `ADMIN_TEST_PHONE`, `ADMIN_TEST_OTP`, and `ADMIN_DEMO_PROJECT_ID` in the ignored project-root `.env`. Fill `ADMIN_DEMO_PROJECT_ID` with the exact development Firebase project ID. These private variables are read by trusted local tooling, never by the Expo client. The test code still must be configured in Firebase Console.
4. Install the trusted claim tool separately: `cd scripts/admin-auth && npm install`. Authenticate locally with Application Default Credentials for the development Firebase project, set `FIREBASE_PROJECT_ID` to the same project ID, and run `npm run claim -- grant`. The tool refuses a grant if the project IDs differ or development mode is off. It looks up the configured test phone account and sets its `admin` custom claim by UID. To revoke, run `npm run claim -- revoke`. Never put service-account credentials in the app or Git.
5. Sign out and sign in again after granting or revoking claims so Firebase issues a fresh ID token.

## Firestore protection

The Stage 1 backend branch has been merged into this feature branch. Its `firestore.rules` now includes a claim-gated `/adminData` path while preserving Customer and shop rules. The rules are not deployed. Run the Firestore emulator denial tests, then deploy through the project's release process before real Admin data is connected. There are no Admin HTTP endpoints in the repository yet; any future endpoint must verify the Firebase ID token and Admin claim server-side.

The Admin dashboard still uses local demo data. Its UI actions do not write to Firestore. The Firebase claim guards screen access; Firestore rules will guard real Admin records once merged and deployed. Neither the demo phone nor its OTP grants an Admin claim.

## Production

Production uses Firebase Phone Authentication and an Admin claim assigned by trusted backend tooling. No test code is accepted by the app. Remove the Firebase test phone from production projects. The Admin URL remains protected by claim verification. `EXPO_PUBLIC_ADMIN_PREVIEW` is no longer used for automatic Dashboard access.
