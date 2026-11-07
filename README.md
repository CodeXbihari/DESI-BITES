# DESI-BITES

Existing Expo / React Native food and grocery delivery prototype. The React Native app now uses Firebase phone authentication; unrelated ordering and payment functionality remains a demo. `desi-app-preview.html` is an independent design prototype and does not implement real authentication.

## Authentication architecture

- `src/context/AuthContext.tsx`: Firebase session subscription, request lock, 60-second resend cooldown, and pending verification session. Confirmation objects stay in memory, never in navigation params or storage.
- `src/services/authService.ts`: native React Native Firebase adapter. Native Firebase persists the session.
- `src/services/authService.web.ts`: Firebase JS SDK adapter with a visible, temporary reCAPTCHA challenge. Firebase manages browser session persistence.
- `src/config/firebase.web.ts`: public web configuration from Expo environment variables.
- `src/services/authValidation.ts`: Indian phone normalization, six-digit code validation, and user-facing errors.
- `App.tsx`: authenticated routes are registered only after Firebase reports a signed-in phone user. Session initialization shows the existing splash. Sign-out removes protected navigation history and remounts shared app state.

The existing onboarding runs on first launch. Returning signed-out users see Login; returning signed-in users see Main after Firebase restores their session. Onboarding can still be replayed from Profile. Request a fresh SMS after restarting during OTP entry; pending confirmations are intentionally not persisted. Android may automatically verify an SMS, in which case the Firebase observer opens Main directly.

## Install and run

Use Node.js 24.12 or newer (Node 24 LTS recommended); the installed Firebase packages require it.

```sh
npm ci
cp .env.example .env
# Fill in your Firebase web app configuration before starting web.
npm run web
```

Native phone authentication requires a custom development build, not Expo Go:

```sh
# First add the platform Firebase config files described below.
npm run android
npm run ios
# For an already installed development build:
npx expo start --dev-client
```

Android requires Android SDK/JDK; iOS requires macOS, Xcode, CocoaPods, and applicable signing. Rebuild after changing native Firebase files or plugins. `app.config.js` enables native Firebase plugins when either platform configuration file exists. Both files are required to build both platforms. Defaults use the existing `com.desi.app` identifiers.

## Firebase Console setup required

1. The selected project is **Desi Bytes**, project ID `desi-bytes-dbc89`, project number `892636562120`. Enable Authentication → Sign-in method → Phone. Configure SMS billing/quota as required by Firebase, and permit India in SMS region policy.
2. The **web app** is registered as `Desi Bytes Web`. Copy its client values into `.env` using `.env.example`. Add your actual hosting/development domains to Authentication → Settings → Authorized domains. Add localhost explicitly if you use it. reCAPTCHA must load in the browser; do not disable app verification for production.
3. Register an **Android app** with package `com.desi.app`. Download `google-services.json` into the project root. Add SHA-1 and SHA-256 fingerprints for development and release signing certificates. Configure Play Integrity/reCAPTCHA requirements and test the actual build on a device.
4. Register an **iOS app** with bundle ID `com.desi.app`. Download `GoogleService-Info.plist` into the root. Configure APNs credentials and Background Modes for remote notifications as required by Firebase phone verification. The auth config plugin adds the reCAPTCHA URL scheme; verify the generated native project and test fallback verification too.
5. Optional native config paths can be set through `GOOGLE_SERVICES_JSON` / `GOOGLE_SERVICE_INFO_PLIST`, including EAS file environment variables.

Client Firebase identifiers are public app configuration, not service-account secrets. Local environment and platform config files are ignored by Git. Never put Admin SDK keys or service-account credentials in the app. Future backend APIs must independently verify Firebase ID tokens; navigation gating alone does not secure server resources.

References: [Expo Firebase integration](https://docs.expo.dev/guides/using-firebase/), [React Native Firebase phone setup](https://rnfirebase.io/auth/phone-auth), [Firebase web phone setup](https://firebase.google.com/docs/auth/web/phone-auth), [Android setup](https://firebase.google.com/docs/auth/android/phone-auth), [iOS setup](https://firebase.google.com/docs/auth/ios/phone-auth).

The Firebase Web SDK is pinned to `13.1.0`, matching React Native Firebase 27.1. Its `@firebase/app` dependency is overridden to the matching `0.16.4` across the tree: otherwise npm can install a newer peer copy and Auth registers against a different Firebase app registry.

## Validation

```sh
npm run typecheck
npm run test:auth
npx expo install --check
npx expo-doctor
npx expo export --platform web
```

Tests cover local phone/code validation, error mapping, missing configuration, and singleton web SDK initialization using `.env` when present. SDK initialization does not remotely validate credentials or send SMS. Firebase Console test numbers can exercise the configured integration without real SMS (label these tests accordingly). Real-device SMS, browser reCAPTCHA, restart persistence, sign-out, expired/invalid codes, offline requests, and platform fallback verification must be checked against your configured Firebase project before release.

Known inherited setup issue: `app.json` references `assets/icon.png`, `assets/splash-icon.png`, `assets/adaptive-icon.png`, and `assets/favicon.png`, which are absent from this checkout. Supply the intended branding assets before native prebuild/release. No replacement artwork is generated by the auth change.

## Implementation verification

- Clean `npm ci` completed using Node 24.22.2.
- `npm run typecheck` passed.
- `npm run test:auth` passed all five tests, including initialization with the supplied web configuration and reuse of one Firebase app/Auth instance. These tests do not validate credentials remotely or send SMS.
- `npx expo export --platform web` succeeded. It warns about the inherited missing favicon.
- Expo Doctor passed 18/20 checks. Remaining failures: the inherited obsolete `splash` field/missing icon assets in `app.json`, and AsyncStorage 3.1.1 where Expo expects 2.2.0. `expo install --check` reports that same existing dependency mismatch. These have not been hidden or changed by the authentication implementation.
- Native Firebase config files have not been supplied; native builds and SMS verification have not been tested. Browser reCAPTCHA/SMS, real valid/invalid OTP submissions, restart persistence, and logout still require interactive validation.
- No deployment, Firebase Hosting changes, commits, or pushes were performed.
