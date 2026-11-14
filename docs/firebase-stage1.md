# Desii Bites Stage 1 Firebase foundation

The separate USB Android verification build is implemented as tracked source in
an Expo config plugin and native templates; see [android-stage1-emulator.md](android-stage1-emulator.md).
The plugin has now been applied to the ignored Android tree using `--no-clean`,
and `:app:assembleStage1` compiled successfully. The separate verification APK uses
`com.desi.app.stage1`; the customer-facing Desi Bytes app remains `com.desi.app`.
Existing customer screens and production Firebase configuration are unchanged.
Physical-device startup, native Auth restoration and Firestore operations remain
unverified; successful compilation does not establish runtime behavior.
The correction phase uses the actual Google Services Property API, checks complete
plugin-owned blocks and keeps native readiness access inside the bootstrap. The
handshake is trusted client wiring; server-side authorization remains necessary.

## Scope and current verification

This is an unconnected, emulator-only foundation. Existing customer Auth,
restaurant menu UI, shared cart and checkout still use their original code.
No production Firestore operations, menu migration, owner assignment, Functions,
payments or customer-screen integration are included. The separate native
verification build has compiled; physical-device runtime verification is pending.

The only order statuses are `placed`, `preparing`, `packed`, `food_ready`.
Every order contract requires exactly `payment: { status: 'unpaid' }`.
There is no payment method field or order/status/history write repository.
Pickup requires no address snapshot or delivery fee; delivery requires a validated
address snapshot. These are read contracts, not an order-creation implementation.

The local contract/isolation/adapter tests run without Firebase resources.
Adapter boundary tests use SDK stubs and do not prove Android native functionality.
The earlier foundation-only authorized `npm run test:emulator` run completed all 23 cases:
**23 passed, 0 failed, 0 skipped, 0 cancelled; exit code 0**. These comprise
14 security-rule cases and 9 Web repository integration cases. The corrected
concurrent-edit test passed, including its final document assertions: exactly one
edit succeeded, the stored revision was 2, the price matched the successful edit,
and protected catalog fields were unchanged. The sequential stale-update test
also passed and still requires the repository's specific `Stale` error.

The run used the official macOS ARM64 Temurin JDK 21.0.13+9. Its archive SHA-256
matched the independently retrieved official checksum and release metadata before
extraction. The temporary archive and runtime were removed after testing. Auth and
Firestore emulators shut down cleanly, with no remaining listeners on ports 9099
and 8080. System Java remains Zulu 17.0.21.0.3; JAVA_HOME, PATH and Android JDK
settings were unchanged. No production Firebase operations occurred.

These results verify the tested local foundation, not production readiness.
Native Android Firestore execution is unverified. Customer screens are not
connected to the new repositories; menu migration, authoritative order creation
and order status updates are not implemented. Production indexes and trusted order
services are not certified. The rules have been exercised locally but are not
deployed or certified for every production security scenario.

## Files and boundaries

- `src/backend/types.ts`: platform-neutral document shapes. `Entity<T>.id` comes
  from the document path; IDs are never duplicated mutable fields in documents.
- `validation.ts`: strict order/payment/address/profile/menu-patch contracts.
- `repositories.ts`: typed API, including read-only order/history/membership access.
- `firestore/repositories.ts`: shared query and transaction implementation.
- `firestore/adapterTypes.ts`: internal SDK boundary; not an app-facing write API.
- `firestore/adapter.ts`: Android React Native Firebase implementation.
- `firestore/adapter.web.ts`: Firebase JavaScript implementation.
- `firestore/mappers.ts`: independent timestamp values, validated menu/order reads.
- `demoRepositories.ts`: fresh private in-memory data; no Firebase SDK imports.
- `createRepositories.ts`: selects demo BEFORE invoking any Firebase loader.
- `src/config/firebaseTarget.ts`: explicit development-only loopback targets.

Neither adapter initializes a second Firebase app. A future bootstrap must supply
the SAME existing app used by its platform Auth implementation and call the
adapter before sign-in, Auth observers, Firestore operations or restored production
sessions. There is no implicit import of `.env`, default project lookup, production
endpoint, runtime environment-variable discovery or cloud fallback here.

The adapters use their app's real SDK `currentUser.uid`, not a user-supplied UID or
an AuthContext mock object. Repository calls resolve the current UID anew. Android
must use React Native Firebase Auth with native Firestore; Web must use the
JavaScript Auth/Firestore app pair. Do not combine their sessions.

Adapters use server reads and memory-only emulator storage. Reusing an app with
a different target fails. An existing signed-in non-emulator session is rejected.
Always use a fresh isolated test app/device installation; do not redirect a
customer's existing production session into an emulator.

## Explicit factory usage (future bootstrap, not connected to screens)

```ts
const target = {
  mode: 'emulator' as const,
  development: true as const,
  projectId: 'demo-desiibites-stage1',
  host: '127.0.0.1' as const,
  authPort: 9099,
  firestorePort: 8080,
};

// Web: app is an already-created isolated test app, also used for Auth.
const repositories = await createRepositories(
  { authMode: 'firebase', platform: 'web', target },
  async validated => {
    const { createWebAdapter } = await import('../src/backend/firestore/adapter.web');
    return createWebAdapter(app, validated);
  },
);

// Mock auth requires no Firebase app, target or adapter loader.
const demo = await createRepositories({ authMode: 'mock', platform: 'web' });
```

Missing/malformed emulator configuration fails before loading an adapter. The
target accepts only localhost/loopback hosts (plus `10.0.2.2` for Android), distinct
explicit ports, demo project IDs or the existing project ID. A release build's
`__DEV__ === false` rejects emulator repositories. A factory loader is required;
the factory never automatically imports native modules in mock mode.

Do not call raw internal StorePort write operations from application screens.
Firestore Rules remain the authorization boundary even if a caller bypasses a
repository. Demo data is not a production permission simulator and starts empty.
Serial demo usage is intended; concurrent multi-client tests belong in emulators.

## Document layout and access

```text
shops/{shopId}                                  authenticated get; no client writes
  menuCategories/{categoryId}                   active reads; owner draft reads
  menuItems/{originalMenuId}                    published reads; limited owner edits
  members/{uid}                                self get; no client grants or edits
users/{uid}                                    own allowlisted fields
  addresses/{addressId}                         own CRUD
orders/{orderId}                               scoped customer/owner reads only
  statusHistory/{eventId}                       parent-authorized reads only
```

Only public shop information belongs in `shops/{shopId}`. Membership, private
operational records and customer information must not be placed in that readable
document. Customers cannot list profiles or read other customers' addresses.

An owner must have an active `role: 'owner'` record for the specific shop. No real
owner UID is assumed or assigned. Tests create synthetic memberships through the
rules-testing harness only. Email, client profile roles, custom `admin` claims and
Firebase/Google Cloud IAM ownership do not substitute for membership.

Eventually, a trusted administrator must independently verify the intended person's
Firebase Auth UID and separately authorize a protected membership grant. Client
membership writes are denied, even for an existing owner. Revocation changes
`active` to false through a future approved administrative process.

Stage 1 permits existing-item `pricePaise` and `available` updates, with
`revision = old revision + 1` and a server update timestamp. Repository transactions
require the caller's expected revision and reject stale edits. Names, category IDs,
bundled image keys, descriptions, vegetarian flags, publication and other catalog
fields are immutable to clients. New document IDs, replacements and deletes are
denied. No Firestore-backed owner dashboard is included; the existing admin
preview remains a separate demo.

A default address must exist under the same user's addresses after the atomic
write. Slashes/path injection and foreign/missing addresses fail. Deleting a default
address without clearing the profile reference also fails; the address repository
clears the reference and deletes the address in one transaction. Client rules and
repository checks both enforce the relationship.

Order creation, authoritative pricing, status transitions, history append and all
payment changes require a later trusted backend. Server SDKs bypass Rules and
must independently validate Auth, membership and input. No such backend exists
in Stage 1. The read repositories cannot write orders, totals or histories.

## Query and index design

Customer menu queries constrain `published == true`; category queries constrain
`isActive == true`. Customer order queries constrain both current UID and shop ID;
owner order queries constrain an authorized shop ID. Rules are not result filters.
Order pages use bounded limits, `createdAt DESC`, explicit document-ID tie breaking
and a document cursor. An unauthorized/removed cursor fails rather than broadening
the query. History is read per order, not by collection-group query.

`firestore.indexes.json` contains the corresponding proposed collection indexes
and exemptions for unqueried order snapshots. The emulator does not enforce
compound indexes; successful emulator tests cannot certify deployment indexes.
No index deployment or production query has been performed.

## Emulator workflow

The launcher is pinned to `demo-desiibites-stage1`, `firebase.emulators.json`,
Auth on `127.0.0.1:9099` and Firestore on `127.0.0.1:8080`. It checks Java before
starting the CLI and never downloads Java. Emulator artifacts were made available
for the authorized runs; a fresh environment may need them separately. The final
run used only this demo project and these local endpoints, with synthetic data.

For a future separately authorized verification, after making Java 21+ available:

```sh
npm run typecheck -- --incremental false
npm run test:auth
npm run test:backend
npm run test:emulator
```

`test:auth` retains the original 24-test glob. `test:backend` runs local foundation
tests in `tests/backend/`. `test:emulator` runs the emulator test files serially,
loads the actual Rules, seeds only synthetic fixtures and clears emulator data.
Emulator tests refuse to run without BOTH loopback emulator hosts and the expected
synthetic project. They do not read `.env`, platform config files or production
records. Auth compatibility uses anonymous emulator identities, not phone OTPs.
Rules unit contexts are distinct from the app's mock-auth mode.

Permission tests cover cross-user profiles/addresses, default references, protected
catalog fields, wrong-shop/inactive owner edits, revision checks, membership
self-assignment, published queries, scoped orders and denial of all order/history
writes. Repository integration tests cover actual Web Auth emulator sessions,
transactions, pagination, revocation, session switching and no order mutation API.

For a later Android smoke test, the native default app and BOTH emulator services
must share `demo-desiibites-stage1`. Use only the generated and compiled isolated
`com.desi.app.stage1` verification APK, with explicitly reversed localhost ports as
documented in [android-stage1-emulator.md](android-stage1-emulator.md). The ordinary
`com.desi.app` app retains `desi-bytes-dbc89`; never redirect its production sessions.
The Stage 1 APK has not been installed or launched, and native runtime behavior
has not been certified. Device installation and smoke testing require separate approval.

## Dependency record

Published metadata verified before installation:

- `@react-native-firebase/firestore@27.1.0`: exact App peer `27.1.0`.
- `@firebase/rules-unit-testing@6.0.0`: Firebase peer `^13.0.0`, Node `>=24.12.0`.
- `firebase-tools@15.36.0`: Node 24 supported; emulator launcher requires Java 21+.

The original lockfile was first reproduced using `npm ci`; typecheck and all 24
baseline tests passed before and after. This synchronized the six existing Expo
installed-versus-lockfile differences without editing tracked files. The exact three
approved packages were then added. No previously locked package version changed
and no previous dependency path was removed. New tooling adds transitive packages;
review the manifest/lockfile diff before any future commit. The existing Firebase
App override remains unchanged. No forced/legacy peer resolution or automatic
vulnerability fixes were used.

A later approved compatibility correction added the exact override
`@firebase/app-compat: "0.5.20"`, preserving `@firebase/app: "0.16.4"`, Firebase
13.1.0 and React Native Firebase 27.1.0. Rules Unit Testing and Firestore compat
now resolve the same compat installation and namespace. This corrected the
fixture failure `this.getApp(...).firestore is not a function`; the final emulator
run completed successfully. This was a targeted dependency correction, not a
Firebase SDK upgrade.

npm reported existing module-type warnings, transitive deprecation warnings and
unapproved install scripts for Firebase util/protobuf/re2. No script approvals were
granted. These warnings were not hidden or resolved by unrelated upgrades.

## Deferred approvals

No production resources, migrations, owner membership, schema deployment or
screen integration may follow automatically. The 122-item source catalog and all
existing images remain unchanged. The emulator suite has completed successfully;
future runs still require Java 21+. The original temporary runtime was removed;
a later verified temporary JDK was retained for reuse during the approved native build.
Further native rebuilds and device smoke testing, screen integration, menu migration, trusted order
services and eventual database/index validation remain separate work requiring
approval. Emulator success does not authorize production deployment.
