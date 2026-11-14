# Isolated Android Stage 1 verification

Native Android generation and local Stage 1 compilation have now completed.
The controlled prebuild used explicit `--no-clean`, and `:app:assembleStage1`
succeeded. The resulting verification APK is separate from the customer-facing
Desi Bytes app. No APK installation or device launch has been performed; native
startup, Auth restoration and Firestore runtime behavior remain unverified.

## Separate identities

| | Existing debug/release | Stage 1 |
|---|---|---|
| Application ID | `com.desi.app` | `com.desi.app.stage1` |
| Firebase project | Existing `desi-bytes-dbc89` configuration | `demo-desiibites-stage1` |
| Native root | `main` | `DesiiBitesStage1` |
| Auth state/storage | Existing sandbox | Separate sandbox |
| JavaScript | Existing customer App | Repository verification harness |

`config/firebase/stage1.google-services.json` contains intentionally fabricated
emulator-only identifiers, including a fake API key. They are not Firebase account
credentials. Do not register this synthetic app in Firebase Console or replace the
existing Google Services files. No production membership or account is created.

## Reproducible native files

`android/` is ignored. Native changes live in tracked `plugins/withStage1Android.cjs`
and `plugins/stage1/` templates. The Expo config plugin is registered by
`app.config.js`; its modifications run only during a separately approved prebuild.
It adds a `stage1` build type, copies the synthetic configuration into
`android/app/src/stage1/`, and installs native hooks in MainApplication/MainActivity.
The plugin has been applied to the existing ignored Android tree without clearing
it. Existing APKs and `local.properties` were preserved and matched the verified backup.

The transforms preserve debug/release blocks, add Stage 1 hooks conditionally,
and reject unknown insertion points instead of guessing. Differing existing
Stage 1 generated templates are not overwritten. The Google Services task must
select exactly `src/stage1/google-services.json`; missing, incorrect or fallback
configuration fails. Its project and package are checked before Stage 1 work.
The Stage 1 manifest allows local HTTP and disables backup only for this variant.

The Google Services 4.4.4 task exposes `googleServicesJsonFiles` as
`Property<Collection<File>>`. The guard calls `.get().find { it.isFile() }`, then
compares the selected file's canonical path. `.files` is not supported on this
Property. A local regression loads the actual cached task/interface JARs and
executes the generated guard using plain Groovy; it demonstrates that the old
access fails and a non-Stage-1 fallback is rejected. It runs no Gradle task.

Both JavaScript and generated Gradle validation require the exact synthetic
project/number, package, mobile app ID, fake API key and configuration version.
Additional credential/configuration fields are rejected. No Console registration
or real Firebase credential is needed. Complete owned blocks are checked on
reapplication; partial, duplicate or conflicting definitions are rejected before
changes. Template destinations are all checked before any is written.

`DESII_BUILD_TARGET` does not change the shared Expo name or Android package.
The emulator label exists only in the Stage 1 build-type resource. Normal config
defaults are tested for full equality with that flag present and absent.

Because prebuild can change unrelated generated native files, inspect/backup the
current ignored Android tree and obtain approval before regeneration. Always pass
`--no-clean`: the installed Expo CLI recreates native folders by default even when
`--clean` is omitted. No clearing prebuild is part of this procedure. Future template updates may require manual
review rather than an automatic overwrite.

## Startup and fail-closed behavior

Android's default Firebase provider reads the variant's synthetic resources.
MainApplication invokes Stage1FirebaseBootstrap before `loadReactNative`.
Native code verifies the package and Firebase project, connects Auth to
`127.0.0.1:9099`, disables Firestore persistence and connects Firestore to
`127.0.0.1:8080`. Only then is native readiness marked true. SDK-internal
restoration can occur when native Auth is instantiated; it has only this separate
synthetic app's storage. No production session is reused. RN Auth listeners,
JavaScript observers, sign-in and repository operations start after native setup.

MainActivity requests the distinct `DesiiBitesStage1` root. Missing native module,
bad identity or failed initialization blocks that root; it cannot choose the
customer App, mock auth, demo repositories or admin preview as a fallback.
An incompatible Metro bundle that does not register that root fails to render.

Not all native failures can render a React error: missing reflected classes,
registration errors, or duplicate startup invocation can crash before the React
root starts. These are fail-closed startup failures, not a guaranteed error screen.

The native read-only module reports exact identity, ports, USB host and completion
flags. The bootstrap reads NativeModules itself; callers cannot supply a proof
object, alternate loader or environment-variable substitute. It memoizes both
successful and failed initialization. JavaScript validates that before importing Firebase. The existing
`assertMatchingProject` guard remains unchanged and also validates the real SDK
app. The Android adapter's native path uses the already-configured SDKs without
calling RNFB's hostname-remapping connection methods. Its ordinary path retains
the prior checks and explicitly refuses the Stage 1 native app. The shared internal
SDK operation mapper is not a connection/readiness API. Neither that mapper nor
the handshake is a security boundary against modified client JavaScript: this is
trusted application wiring. Firestore rules and any future trusted server remain
responsible for authorization; owner permissions still require shop membership.

Native-ready means connection configuration completed, NOT that emulators are
reachable. Lost forwarding or stopped services causes operation errors. There is
no cloud fallback. The UI reports setup errors without revealing SDK details.

## First transport: USB Samsung

This implementation supports only USB/loopback. AVD `10.0.2.2`, LAN IPs and a
transport override are not implemented. The target validator's existing allowlist
is unchanged; the stricter native readiness contract permits only USB loopback.
Do not enable a global RNFB hostname-remapping bypass.

After separate installation/device approval, identify the intended Samsung serial
and forward only that device's ports:

```sh
adb -s SERIAL reverse tcp:8081 tcp:8081
adb -s SERIAL reverse tcp:9099 tcp:9099
adb -s SERIAL reverse tcp:8080 tcp:8080
```

The Firebase emulators remain bound to the Mac's `127.0.0.1`. Native SDKs on the
phone use the phone's `127.0.0.1`, which ADB forwards. No LAN binding is required.
Never open the existing production-configured app for this smoke test.

## Future approved commands (not automatically authorized)

Use the existing verified JDK while it remains available; `/tmp` is not permanent:

```sh
DESI_JDK21='/tmp/desiibites-jdk21-reusable-4t0kavfh/java21/runtime/jdk-21.0.13+9/Contents/Home'
```

First obtain approval to apply the plugin through non-clean native regeneration.
From the repository root, the proposed command is:

```sh
EXPO_NO_DOTENV=1 ./node_modules/.bin/expo prebuild --platform android --no-install --no-clean
```

Review every generated diff, confirm existing configuration files are unchanged,
and inspect Stage 1 resources and hooks. Only then obtain build approval:

```sh
cd android
JAVA_HOME="$DESI_JDK21" PATH="$DESI_JDK21/bin:$PATH" \
  ./gradlew --no-daemon "-Dorg.gradle.java.home=$DESI_JDK21" :app:assembleStage1
```

No `clean`, APK installation or launch is implied. Expect the output under
`android/app/build/outputs/apk/stage1/`. Before installation inspect its actual
package (`com.desi.app.stage1`), project resource (`demo-desiibites-stage1`),
debuggability, native Firebase modules and SHA-256. Recheck these for every new artifact;
compilation and APK identity inspection do not verify physical-device behavior.

Start interactive emulators in a separate terminal from the repository root:

```sh
JAVA_HOME="$DESI_JDK21" PATH="$DESI_JDK21/bin:$PATH" \
  node node_modules/firebase-tools/lib/bin/firebase.js emulators:start \
  --config firebase.emulators.json --project demo-desiibites-stage1 --only auth,firestore
```

Seed into an exclusively used emulator session:

```sh
GCLOUD_PROJECT=demo-desiibites-stage1 \
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
  node tests/native/seedStage1.mjs
```

The seeder looks up fixed synthetic UIDs through the project-scoped local admin
API. It creates missing accounts, reuses matching identities, and rejects wrong
emails, disabled identities, custom privileges and incompatible providers. It
never overwrites accounts or resets existing passwords. If someone has changed a
synthetic password, sign-in may fail; the seeder will not repair it silently.
No accounts are deleted, all-data clears performed, or data exported.

Auth account creation cannot be atomic with Firestore writes. On partial Auth
failure the already-created synthetic accounts remain, and no Firestore fixture
batch is written. Rerunning safely reuses those accounts and completes missing
ones. Once all accounts pass validation, one atomic batch resets the documented
synthetic fixture paths to their fixed baseline, including owner membership.
This intentionally resets fixture edits/revocation at those paths; it leaves other
paths alone. Only this exact demo project and loopback endpoints are accepted,
redirects are rejected and requests have a timeout. Its local
administrative bypass exists only in this host-side test utility, never in the APK.
Do not run alongside another test session using the same demo project.

Start Metro without loading production dotenv settings:

```sh
EXPO_NO_DOTENV=1 DESII_BUILD_TARGET=stage1 \
EXPO_PUBLIC_AUTH_MODE=firebase EXPO_PUBLIC_ADMIN_PREVIEW=0 \
  ./node_modules/.bin/expo start --dev-client --localhost --port 8081
```

The native build type, not `DESII_BUILD_TARGET`, selects the root and permissions.
After separate launch approval, launch only `com.desi.app.stage1` by its package
identity and enter the Metro URL in its development launcher. Avoid generic Expo
deep links that could select another installed development app sharing a scheme.
The debuggable Stage 1 variant receives JavaScript from Metro, not an embedded
release bundle. Stop if native identity differs from the values above.

## Synthetic authorization checks

The harness uses email/password authentication against the Auth Emulator with
obviously synthetic `@example.invalid` test identities. Its fixed password is
test data, not a real account credential. This is not customer phone-auth testing.

- Customer: published menu/own profile reads succeed; owner draft access fails.
- Owner: only its seeded shop membership grants owner access; fixture edits remain
  limited to the existing repository/rules price and availability permissions.
- Unprivileged identity: no membership, no owner access.
- Admin: no application-admin role exists. The harness does not create one.
  Existing rules tests verify that claimed admin/email authority grants nothing.
- Sign out, switch accounts and restart: verify data does not leak between users,
  and restored synthetic sessions work without reconnecting to another endpoint.
- Stop an emulator/remove a forward: requests must fail; do not change to cloud
  configuration or the existing application to make the test succeed.

Existing customer, cart, checkout, menu data, admin demo, rules and indexes are
unchanged. Real teammate accounts and production owner authorization are not
verified by synthetic fixtures. Payment stays unpaid; there is no order/status
mutation service. Automated SDK stubs and emulator tests do not certify Kotlin
compilation, the new native module bridge, physical routing or restored sessions
on a Samsung device. Compilation has now passed separately; the remaining runtime
checks require separately approved device tests.

## Implementation verification record

The first source implementation passed typecheck, baseline 24/24, local backend
62/62 and emulator 24/24. The correction phase extends coverage with the installed
Google Services API regression, corrupt/duplicate blocks, shared config equality,
bootstrap-owned native state, seeder collisions, partial Auth failure/retry and
repeated fixture seeding. Final correction results: typecheck passed, baseline
24/24, local backend 63/63, and emulator 24/24; zero failed, skipped or cancelled
in the final runs. The first standalone Groovy harness run lacked Gradle's implicit
GradleException import; after reproducing that import it passed. No Gradle task
was executed by this regression.

These test counts are historical JavaScript/emulator results. Native generation
and compilation were subsequently verified separately:

- Controlled prebuild: Android only, `--no-install --no-clean`, exit code 0.
- Native build: `:app:assembleStage1`, successful in 56 seconds with Temurin 21.0.13+9.
- APK: `android/app/build/outputs/apk/stage1/app-stage1.apk`, 211,201,262 bytes.
- SHA-256: `17125befb7829188dff97b961de630bcf6bbfe3a30d277c8e27e18db46577daa`.
- APK application ID: `com.desi.app.stage1`; build type `stage1`; debuggable.
- Label: `Desii Bites — Emulator`; the customer-facing app remains separate.

The native build emitted Gradle/Android/Kotlin deprecation and manifest-merger
warnings. Prebuild warned about missing `expo-system-ui`; no package was installed
to suppress it. The known Expo-generated Gradle project-name change to `Desi Bytes`
does not change the production application ID or Firebase configuration.

The latest pre-commit checks passed typecheck, baseline 24/24 and backend 63/63.
The emulator rerun exited 1 before executing tests because an existing interactive
demo emulator session occupied ports 9099 and 8080. That failed startup does not
supersede the historical successful emulator results or establish a fresh pass.
No existing process was stopped and no second session was retried.

Restored native Auth sessions, actual native startup ordering, native Firestore
requests and physical USB routing remain device verification requirements. The APK
has not been installed or launched; neither compilation nor SDK stubs proves these
runtime behaviors. No production readiness or production Firebase operation is implied.
