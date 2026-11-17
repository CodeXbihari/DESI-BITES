# Stage 4 — emulator-only trusted quotes and order confirmation

Phase 1B's pure TypeScript domain foundation is preserved. Phase 2 adds one
authenticated callable, `createCustomerQuote`, and its Admin Firestore adapter.
The confirmation milestone adds `confirmCustomerOrder` and `getCustomerOrder`.
It persists quotes and unpaid test orders only in the isolated emulator suite.
It cannot collect payments. Existing client order/history writes remain denied.
There is no deploy script and no production configuration or credential.

Run from the repository root using the already installed toolchain:

```
npm --prefix functions run typecheck
npm --prefix functions test
npm --prefix functions run build
npm --prefix functions run test:emulator
```

The runtime is Node 24 (`nodejs24`), supported by installed Firebase CLI 15.36.0
and the current Cloud Run functions runtime schedule, matching local Node 24.22.2.
TypeScript 6.0.3 is reused from the root installation. Server-only dependencies
are pinned to `firebase-admin` 14.5.1 and `firebase-functions` 7.4.0 in this separate
npm package/lockfile. The root dependencies and lockfile are untouched.
The build rewrites relative `.ts` imports and compiles the reused backend
contracts alongside the server into `lib/`; the entry is
`lib/functions/src/index.js`. This keeps shared models without copying schemas.
`lib/` and the package's `node_modules/` are ignored generated directories.

Runtime reference: https://docs.cloud.google.com/functions/docs/runtime-support

## Phase 2 callable and local configuration

Use the Java-gated test command above. It builds, then launches only Auth (9099),
Firestore (8080) and Functions (5001), all loopback, using
`firebase.emulators.json` and explicit project `demo-desiibites-stage1`.
No default project alias or production `firebase.json` is added. Java >=21 is
required; the runner stops before building/launching if unavailable and installs
nothing. It includes the existing Stage 1 emulator suites plus the quote suite,
serially; do not add their overlapping coverage to the pure-test counts.

`createCustomerQuote` uses `onCall` authentication, requires a UID, and ignores no
unknown request fields: UID, prices, totals, statuses and inline addresses are
rejected. The review response returns quote ID, policy, expiry, item snapshots,
fulfillment/address snapshot and totals. There is no quote-retrieval endpoint;
the response is returned only to the authenticated request that created it.

`requireQuoteEmulators` requires Functions emulator mode, matching
`GCLOUD_PROJECT` and `FIREBASE_CONFIG.projectId`, and exact Auth/Firestore loopback
hosts. Both callable entry and Admin initialization check it. Admin uses a named
isolated app with explicit project and the documented `initializeApp({ projectId })`
approach. The validated `FIRESTORE_EMULATOR_HOST` selects insecure loopback
transport; the Firestore SDK supplies emulator authentication without obtaining a
production token. No service-account file or custom credential is supplied.
Missing emulator configuration fails closed, including an accidental
deployment invocation. No Admin code is imported by the customer application.

Existing database paths and schemas are reused exactly:
`shops/{shopId}`, its `menuItems/{itemId}` and `menuCategories/{categoryId}`, and
`users/{authenticatedUid}/addresses/{addressId}`. There is no foreign-address
lookup. A transaction reads canonical documents consistently and writes one quote
only after shop/menu/category/address validation succeeds. Missing documents,
inactive categories, unpublished/unavailable items, unsupported fulfillment and
invalid saved addresses reject the quote. Persistence errors return `unavailable`.

**New server-only collection:** `customerQuotes/{generatedId}` stores the Phase 1B
quote (`id`, `policyId`, normalized `submission`, nested order-shaped snapshot,
`consumedOrderId: null`) plus top-level `customerUid` and `shopId`. Top-level
`createdAt`/`expiresAt` and nested snapshot audit times are Firestore Timestamps.
The nested snapshot's placed/unpaid fields do not create an order/payment record.
Existing catch-all rules deny every client read/write on this collection, including
the owner; rules have not been changed. Quote IDs/expiry are not authorization.
No automatic expiry deletion/TTL is configured. The timestamp records validity;
confirmation rejects expired quotes and revalidates canonical data.

## Modules and trust boundary

- `submission.ts`: allowlisted client references, positive integer quantities,
  duplicate/path rejection, pickup/delivery address requirements and confirmation
  key shape. Client identity, monetary fields and statuses are rejected.
- `demoPricing.ts`: integer-paise arithmetic using BigInt intermediates; returns
  safe JSON numbers and rejects overflow.
- `quote.ts`: builds snapshots from server-supplied shop/menu/category/address
  records and a server clock; checks shop availability, categories, item availability,
  matching saved-address identity and test quantity limits. Produces an expiring,
  UID-bound quote and a Stage 1-compatible initial placed/unpaid order value.

`TrustedQuoteContext` is a server-side calling convention, NOT token verification.
The callable derives it from verified Auth and canonical Admin reads, never client
context/quote input. Unit tests substitute SDK storage and callable auth; they do
not prove token verification, Firestore rules or emulator concurrency. Dedicated
emulator tests cover the HTTP callable and quote rules when the environment exists.
Initial-order conversion only returns a value; it neither saves an order nor
consumes a quote. The confirmation service supplies those transaction guarantees.

## Explicit test-only pricing policy

`TEST_ONLY_DEMO_POLICY_V1` (`test-only-demo-v1`) mirrors the existing
`src/services/cart.ts` calculation, not confirmed restaurant policy:

- INR integer paise; delivery fee 3500 paise.
- Free delivery at subtotal **greater than or equal to** 49900 paise, before discount.
- Pickup, empty subtotal and `DESIEXPRESS` have no delivery fee.
- `SPICE20` discounts 20%; existing `FESTIVE40` discounts 40%.
- Discounts round to a whole rupee, including upward half ties, matching
  `Math.round(subtotalPaise * percentage / 10000) * 100`.
- Unknown coupons are rejected. A tiny paise subtotal whose rounded discount
  exceeds subtotal is rejected rather than producing an invalid Stage 1 order.
- New provisional test safeguards: 99 units per item and 500 units per order;
  maximum 100 distinct lines follows the existing Stage 1 contract.
- Quote lifetime is a provisional five minutes; expiry is exclusive.

These values, coupon authorization, limits, expiry and any future tax/service fee
must be approved/replaced before live ordering. No production policy is defined.

## Trusted confirmation and retry protocol

1. Actual emulator tests run with process-local Java >=21; no deployment is needed.
2. Current mock OTP login supplies no Firebase token and cannot authenticate these
   callables; future UI integration needs an isolated shared emulator Auth session.
3. `confirmCustomerOrder` derives UID from verified callable authentication.
4. Confirm with `{quoteId, submissionKey}`. Require a randomly generated stable
   key (e.g. UUID), scoped to UID, retained across network retries. Validation of
   its shape does not generate entropy; transactional receipts implement idempotency.
5. In an Admin Firestore transaction, first check the UID-scoped submission receipt:
   same key/input returns its existing order even after quote expiry; conflicting
   reuse fails. A consumed quote cannot create a second order under another key.
   Re-read shop/menu/category/address/policy and reject changes requiring renewed
   review. Read everything before writes.
6. Atomically create order plus initial `null -> placed` history, consume quote
   and record receipt. Use server-assigned timestamps/order ID. Keep item/address
   snapshots immutable. Do not add quote metadata to the strict Stage 1 order
   document. Never run payment/notification side effects inside retryable transactions.
7. Actual emulator tests cover ownership, races, idempotency, failure/retry and
   denied client writes. Current records have availability booleans only, not
   inventory reservations. Checkout integration remains outside this milestone.

### Persisted documents and ownership

- `orders/{serverGeneratedId}` is exactly the existing `src/backend/types.ts`
  `Order` contract: customer UID, shop ID, item name/image/price/revision snapshots,
  quantities, INR integer-paise totals, fulfillment and address snapshot/null,
  `status: placed`, `statusVersion: 1`, `payment: { status: unpaid }` and server
  audit times. No quote or submission metadata is added to this strict document.
- `orders/{id}/statusHistory/initial`: `fromStatus: null`, `toStatus: placed`,
  authenticated `actorUid`, `actorRole: customer`, `statusVersion: 1`, `createdAt`.
- `customerQuotes/{id}` retains its reviewed immutable snapshots; only the existing
  `consumedOrderId` field is set on confirmation.
- New server-only `orderSubmissions/{sha256(uid + NUL + submissionKey)}`: exactly
  `customerUid`, `quoteId`, `orderId`, `createdAt`. Raw keys are not stored. Same
  key/different quote returns `already-exists`; consumed quote/new key is rejected.
  A receipt retry returns the original existing order before checking quote expiry
  or menu changes, recovering lost responses without another order/history event.
  No TTL/cleanup is configured: receipts must not be purged before their intended
  retry guarantee is defined. Quotes/receipts have no client access under the
  unchanged catch-all rules.

Firestore audit/receipt times are server-generated Timestamps; transport and domain
values use the existing SDK-independent Instant contract. Read all source documents
before staging writes. Transactions atomically create order/history/receipt and
consume the quote. A thrown/precommit failure leaves all four unchanged. Concurrent
same-key confirmations return one order; different keys cannot consume one quote
twice. Current data is rebuilt through the same canonical loader and demo pricing
engine used by quoting. Snapshot/price/revision/address/policy differences reject
confirmation with `failed-precondition`, requiring a new reviewed quote.

`getCustomerOrder` accepts only `{orderId}`, requires authenticated ownership and
returns canonical `Entity<Order>`. Missing and foreign records return `not-found`.
Existing Stage 1 `orders.mine`/`history` read the newly created records directly;
existing shop-owner read rules still apply. No frontend repository interface or UI
was changed. Unavailable failures instruct retry with the same quote/key, not a new
key. No external notifications or payment side effects run in transaction callbacks.

No checkout, Orders/Reorder, payment or production changes belong to this phase.
The existing emulator runner requires Java >=21. Unit tests neither launch
emulators nor establish emulator coverage.

## Phase 2 validation recorded locally

- Functions typecheck and build passed; root TypeScript passed.
- Functions unit suite: 35 passed (23 preserved domain tests + 12 new service,
  Admin-adapter-with-SDK-substitute, and callable-guard tests).
- Root suite: 75 passed. Backend suite: 63 passed. These are separate files from
  the Functions unit suite: 173 executed tests, no failures/skips in the final run.
- Compiled entry imported without creating an Admin app, exported only
  `createCustomerQuote`, and rejected a non-emulator invocation.
- `git diff --check` and new-file whitespace checks passed.
- Six new quote integration/rules tests were added but NOT executed. The combined
  emulator runner exited 1 at Java 17 versus the Java >=21 prerequisite, before
  starting any emulator. Existing emulator tests were not executed either.
- No Firebase project data was accessed, no orders/payments were created, and
  nothing was deployed. The quote endpoint still needs real emulator verification.

## Admin initialization repair and completed emulator verification

The first Java 21 emulator run exposed `invalid-credential` in Admin 14.5.1:
Firestore accepts its own default credential wrapper or a service-account
credential, not the previous custom `getAccessToken` object. Removed that object
and the redundant transport settings. Standard `initializeApp({ projectId })`
now follows the validated `FIRESTORE_EMULATOR_HOST`. Although Admin constructs its
default credential wrapper, the Firestore emulator transport supplies its own
local authentication header; no production ADC token or service account is needed.
The exact Functions/project/Auth/Firestore guards remain required on every request
and before cached-store reuse. No client rules or quote validation were changed.

Reference: https://firebase.google.com/docs/emulator-suite/connect_firestore#admin_sdks

Final verification used Temurin Java 21.0.13 only in the runner process, project
`demo-desiibites-stage1`, isolated Firebase/cloud credential configuration, and
loopback endpoints throughout:

- Functions TypeScript and build: passed. Root TypeScript: passed.
- Functions unit tests: **36 passed**, including real SDK initialization and
  rejection of cached-store reuse after an emulator variable disappears.
- Actual emulator suite: **30 passed**, zero failures/skips. This includes all
  **six quote tests** and 24 existing Stage 1 integration/rules tests.
- Invalid HTTP authentication returned 401/UNAUTHENTICATED; valid pickup/delivery
  quotes persisted with trusted prices and UID ownership; forged fields, foreign
  addresses, unavailable items and inactive categories were rejected. Direct
  quote reads/lists/creates/updates/deletes were denied even to their owner.
- Root regression tests: **75 passed**. Backend tests: **63 passed**.
- Total across those four separate suites: **204 passed**, no failures/skips.
- Emulator runner exited 0 and shut down its services. No production access,
  deployment, real order creation or payment processing occurred.

Full emulator-run evidence is outside the repository at
`/private/tmp/desi-admin-init-0v6u1rol/emulator-verification.log`.

## Confirmation milestone validation

- Functions TypeScript, build and root TypeScript passed.
- Functions unit suite: **45 passed** (36 preserved + 9 new confirmation tests).
- Real emulator suite: **47 passed** (17 new confirmation tests + all six existing
  quote tests + 24 existing Stage 1 integration/rules tests), zero failures/skips.
- Root suite: **75 passed**. Backend suite: **63 passed**.
- Total across separate suites: **230 passed**; the six quote tests are included
  in 47, not additional tests.
- Concurrent duplicate requests, competing keys, UID-scoped keys, current-data
  changes, expiry, invalid/foreign quotes, unpaid placed snapshots and initial
  history were verified. A fault injected after staging all writes in a real Admin
  transaction proved rollback, followed by successful retry through the callable.
  This fault test invokes the real transaction adapter directly; authentication
  and normal confirmation are separately exercised over actual callable HTTP.
- Temurin 21.0.13 was selected only for the test process. Auth/Firestore/Functions
  ran under `demo-desiibites-stage1` on loopback and the runner exited 0/shut down.
- Evidence: `/private/tmp/desi-confirmation-_3voxuqe/emulator-verification.log`.

All current pricing/coupons and quantity/expiry limits remain test-only. This is
not live-ordering readiness: UI, operational policy, stock/capacity, payment,
retention and production deployment/security review remain separate work. Address
revalidation compares current owned address content with the reviewed snapshot;
it does not prove a same-ID, identical-content address was never deleted/recreated.
