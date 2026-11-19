# Desi Bites Admin emulator experience

The signed-in Profile has a **Shop administration** entry only in the local
web emulator configuration. It uses the existing Firebase Auth emulator
session and `adminManage` callable. The Admin workspace does not render until the
server confirms the current UID has an active `owner` membership for
`shops/demo-desi-bites`. A customer or inactive owner sees only an access error
and a return action. There is no client role flag or phone allowlist.

The connected workspace provides today’s order counts, status filters, cursor
pagination, order detail and status history, customer order history, the
supported `placed → preparing → packed → food_ready` transitions, existing menu
and category edits, item/category availability, and the shop’s
`acceptsOrders` setting. Catalog create/delete, stock counts, photo edits,
restaurant profile fields, cancellation, and payment actions are not supported
by the current backend and are not exposed as live controls. Orders remain
unpaid. Delivery fulfillment and snapshots are displayed as stored; no delivery
rules or behavior are changed.

## Local owner setup

Start the isolated emulator suite from the repository root:

```sh
npm --prefix functions run build
node node_modules/firebase-tools/lib/bin/firebase.js emulators:start --config firebase.emulators.json --project demo-desiibites-stage1 --only auth,firestore,functions
```

The emulator runtime requires Java 21 or newer. If a local suite is already
running, reuse it; do not start another process on ports 5001, 8080, or 9099.
The Admin callable only works with this explicit loopback project.

If the existing emulator does not already contain `shops/demo-desi-bites` and
the approved catalog, seed it once with the project's create-only local seeder
after checking that it is the intended empty demo database:

```sh
GCLOUD_PROJECT=demo-desiibites-stage1 FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 node --experimental-strip-types scripts/seed_customer_emulator.mjs
```

Launch Expo Web in another terminal:

```sh
EXPO_PUBLIC_CUSTOMER_EMULATOR=1 EXPO_PUBLIC_AUTH_MODE=firebase EXPO_PUBLIC_ADMIN_PREVIEW=0 npm run web -- --host localhost
```

Sign in with a synthetic phone number using the Auth emulator's displayed OTP.
The session UID can then be granted owner access by an operator after confirming
the UID and demo shop. The existing script is deliberately not run by the app:

```sh
GCLOUD_PROJECT=demo-desiibites-stage1 FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 node scripts/grant_local_shop_admin.mjs --uid EXISTING_EMULATOR_UID --shop demo-desi-bites
```

It uses Firestore `create`, so it refuses to replace an existing membership.
Only after this manual local grant can the signed-in owner open Shop
administration. No live Firebase, real customer order, payment, deploy, or
production access is involved.

The Admin UI and callables are emulator scoped. A production owner workflow,
security review, payment integration, and any additional shop/catalog operations
remain outside this demo milestone.
