# Customer checkout and stored order integration

The routed customer flow now uses the existing emulator-only quote/confirmation
backend. No checkout action calls the legacy local `placeOrder`; that method
throws instead of inventing an order. No payments, owner management or deployments
were added. Root dependencies, `.env`, catalog/images/collections and Firestore
rules were not changed.

## Browser preview mode

Persistent ordering requires a real Firebase Auth emulator session. Mock OTP/demo
sessions show an unavailable message and cannot request/confirm persistent orders.
Start the existing Functions/Auth/Firestore suite with project
`demo-desiibites-stage1`, Java 21 selected only for that process, and the existing
`firebase.emulators.json`. The service endpoints are fixed loopback addresses:
Auth 9099, Firestore 8080, Functions 5001.

For a persistent interactive session (the test runner shuts down automatically),
build once with `npm --prefix functions run build`, then run in its own Terminal:

```
JAVA_HOME="$HOME/Library/Java/JavaVirtualMachines/temurin-21.0.13+9-desi-bites.jdk/Contents/Home" PATH="$HOME/Library/Java/JavaVirtualMachines/temurin-21.0.13+9-desi-bites.jdk/Contents/Home/bin:$PATH" node node_modules/firebase-tools/lib/bin/firebase.js emulators:start --config firebase.emulators.json --project demo-desiibites-stage1 --only auth,firestore,functions
```

This sets Java only for that process. Stop the suite with Ctrl-C after previewing.

For interactive preview, after the suite is running, seed the approved catalog
using the following explicitly local command (not required for integration tests):

```
GCLOUD_PROJECT=demo-desiibites-stage1 FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 node --experimental-strip-types scripts/seed_customer_emulator.mjs
```

The script creates `shops/demo-desi-bites` and its existing 122 catalog items and
16 categories. It seeds no orders, payments or customer profiles. All writes use
atomic `create`, so it fails without overwriting any existing shop/menu records.
Only the local test shop is marked accepting pickup/delivery orders; its policy
remains explicitly provisional. Do not run the seed against any other project.

Run Expo Web on loopback with process-only flags, leaving `.env` unchanged:

```
EXPO_PUBLIC_CUSTOMER_EMULATOR=1 EXPO_PUBLIC_AUTH_MODE=firebase EXPO_PUBLIC_ADMIN_PREVIEW=0 npm run web -- --host localhost
```

`getWebAuth` selects a separately named synthetic Firebase app in this mode,
initializing emulator Auth/Firestore before observers and connecting Functions
to port 5001. Firebase phone verification uses emulator-only mock reCAPTCHA, not
Google's live service. Use a synthetic phone number and the code displayed by the
Auth emulator. No real SMS is sent. Open a localhost/127.0.0.1 browser URL.
The menu, saved addresses and order API share the same app, SDK UID and repository.
No provider silently falls back to demo data after an emulator error.

The new persistent transport is currently for the browser development preview.
Other platforms explicitly report unavailable instead of routing to production or
using local fabricated orders. Native transport/device verification is separate
from this browser milestone; no APK was built.

## Journey and safety

1. Home/Search/categories use the shared menu. Cart arithmetic remains an estimate.
2. Checkout accepts pickup without an address; delivery needs a valid selected
   saved address from the shared account context.
3. Review requests `createCustomerQuote` with item IDs/quantities, fulfillment,
   saved address ID and coupon. The UI shows server item snapshots and all totals.
4. Explicit confirmation uses `confirmCustomerOrder` with only quote ID and a
   securely generated submission key. Cart/address/coupon changes invalidate review.
5. An uncertain result retains the original quote/key and blocks another quote.
   The pending attempt is written to UID-scoped AsyncStorage before the request;
   returning to checkout or reloading offers the same submission retry. Definitive
   rejection requires a new quote and review. Restored attempts never auto-submit.
6. After validated server success, cart clearing requires the same UID, cart
   instance and revision. Changed/new carts are retained completely; no newly added
   items are removed. A restored attempt cannot clear a new cart with the same
   numeric revision. An old history request cannot erase a confirmed order.
7. Confirmation and details retrieve via `getCustomerOrder` and display Placed,
   Unpaid, no payment collected, final total and pickup/delivery snapshots.
8. Orders loads `orders.mine` with pagination, refresh, retry and ownership checks.
   Reorder consumes canonical order lines, skips missing/unavailable dishes and
   explicitly refreshes matching cart product snapshots to current menu prices.
   It never places an order; a new quote/review is always required.

Session controllers reject stale identity, quote, history and details responses.
The entire customer provider tree is keyed by UID. The callable transport validates
returned contracts and ownership before delivery. User-local pending attempt data
is never trusted for server pricing/ownership: the server revalidates its stored
quote and only accepts quote ID/key. Direct client order/history writes remain
denied. No payment status is submitted from the client.

If browser storage cannot restore a pending attempt safely, checkout blocks new
submission and asks for recovery rather than discarding an uncertain key. Real
customer support/recovery policy remains a pre-live decision.

## Verification and limits

- Actual controller/transport tests cover pickup/delivery, timeout and stable-key
  retry, pending restoration, duplicate handlers, cart changes/reloads, account
  switches, out-of-order history, owned details and unavailable states.
- Existing React Native Web server-render tests now cover trusted review buttons,
  unpaid confirmation/history, loading/empty/error/pagination and canonical Reorder.
  Context inputs are substituted; these do not mount provider effects.
- Three new emulator tests exercise the actual customer controller/typed service
  over Firebase callable HTTP, including post-commit response loss and SDK sign-out.
  A fourth verifies all 122 catalog items are seeded intact and re-seeding cannot
  overwrite existing data.
- Full emulator run: 51 passed (47 preserved + four new), zero failures/skips.
  Evidence: `/private/tmp/desi-customer-final-pw2nsxn4/emulator-verification.log`.
- Root suite: 97 passed; backend suite: 63 passed; Functions unit suite: 45 passed.
  Total: 256 distinct test executions across the final four suites, no failures or
  skips. Earlier intermediate runs are not added to this total. Both TypeScript
  checks, Functions build and git diff --check passed.
- An emulator-mode development web export succeeded (938 modules) at
  `/private/tmp/desi-customer-web-pdc42iie/export`.
- Interactive browser automation was attempted, but the browser host was unavailable
  and native browser access timed out. No clicked browser journey, mounted React
  lifecycle or device flow is claimed. No browser test dependency was installed.

Manual browser checks still required: synthetic phone login, profile/address forms,
pickup and delivery quote review/confirmation, navigation, refresh/history, retry
after disconnect, account switching and confirming with a cart edited concurrently.
All demo pricing/coupons, operational policy, stock/capacity, payment and production
readiness remain separate from the verified emulator backend and client data flow.
