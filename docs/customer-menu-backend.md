# Customer menu repository integration

Home, category tiles, Search Results, the retained Menu screen and Reorder now
consume one CustomerMenuProvider. The provider calls the existing Stage 1
`menu.list(shopId)` and `menu.categories(shopId)` APIs. The presentation adapter
reuses SearchMenuItem, resolves repository category IDs into names, converts
integer paise into rupees, and resolves imageAssetKey through MENU_IMAGES.
Home collection IDs and name-only Search Results matching are unchanged.

## Current default: explicit local demo catalog

App mounts the provider without a Firebase repository. In development it uses
createRepositories with mock mode and a private menu seed adapted from the
existing restaurantMenu.json. All 122 entries, their IDs, names, categories,
prices, flags, descriptions, notes and image paths are preserved. The original
JSON and images are unchanged; no second catalog is maintained. Synthetic audit
timestamps, category IDs, publication flags and revisions exist only in memory.
The default unseeded Stage 1 demo factory still starts empty.

The visible “Local demo menu · bundled catalog · no live stock” notice identifies
this fallback even when customer authentication uses Firebase. No Firebase SDK is
initialized by menu setup, and no network/database writes or owner grants occur.
Use EXPO_PUBLIC_AUTH_MODE=mock and EXPO_PUBLIC_ADMIN_PREVIEW=0 as process settings
for browser development; the existing demo OTP is 123123. No .env changes required.

## Emulator boundary and limitations

CustomerMenuProvider accepts `repository` and `shopId` props. An isolated emulator
bootstrap can inject an authenticated Stage 1 repository created with the existing
explicit target and adapter loader. Bootstrap must connect Auth/Firestore emulators
before any Auth observers or operations, using the same isolated Firebase app.
The customer app does not automatically create that bootstrap or redirect its
existing Firebase Auth session. Emulator wiring and catalog seeding are a separate
step; no production repository mode is introduced here.

An injected repository never falls back to JSON on error or an empty response.
Loading clears prior results, empty responses show an empty state, and errors show
a retry action. Unmount/retry ignores obsolete async results. Unknown asset keys
or invalid documents fail instead of inventing data. Unpublished items and items
outside the active category set are excluded; unavailable dishes remain visible.
Release builds are blocked from this temporary demo/emulator integration.

Stage 1's category query only returns active categories, whereas its item query
can return published dishes in inactive categories. The customer adapter omits
items whose category is absent from that active set, including genuinely missing
category references. Those two cases cannot be distinguished by this read API.
No categories or replacement item fields are invented, valid active-category items
are unchanged, and a rejected item/category query still fails the whole request.
If catalog-integrity diagnostics are needed, use a separate trusted inspection
process; this customer adapter does not fetch private/inactive categories.

Reorder uses the shared menu status component for loading, error and actual
provider retry. Buttons and the handler are guarded while loading, on errors or
when the successfully loaded menu is empty. Empty order history is still shown
independently. Once data is ready, missing/unavailable dishes receive the existing
unavailability notice and available dishes use their current menu lookup. Old
unavailability notices clear when the menu state changes.

Stage 1 can represent every current JSON field. It has no hindiName field; the
seed adapter explicitly rejects it if a future catalog adds one. Admin demo and
the standalone HTML design mockup retain their existing independent demo behavior.
Legacy unused Home components still retain their catalog imports; they are not
mounted by current customer navigation.

## Validation

Run TypeScript, tests/customerMenu.test.mjs plus the existing menu/backend suites,
and git diff --check. New tests cover exact 122-item round-trip preservation,
images/notes, Home collection references, search, isolation, injected repository
prices/availability, publication/category filtering, failures/retry, empty results
and malformed data. The emulator-adapter test uses an SDK-free StorePort and does
not certify a running Firebase emulator or production connection.

Verification recorded for the original integration, before the review fixes:

- `tsc --noEmit --incremental false`: passed.
- `node --experimental-strip-types --test tests/customerMenu.test.mjs tests/menuSearch.test.mjs tests/backend/*.test.mjs`: 73 passed, 0 failed (6 new data-flow tests).
- `git diff --check`: passed.
- Fresh development web export to `/private/tmp/desi-customer-menu.hlQV88/export`: passed.
- Updated Expo development bundle at `http://localhost:8081`: HTTP 200, with file watching enabled and mock auth set only in the server process.
- `npm run test:emulator`: blocked by the existing Java >=21 prerequisite; installed Java is 17. No Java download or Firebase emulator execution occurred.

Interactive browser screen/login checks remain pending because browser automation
was unavailable in this session. No APK, production data, .env or Firebase
configuration changes were made.

## Review fixes: lifecycle test boundary

The installed environment has React and react-dom, but no react-test-renderer,
Testing Library, jsdom, happy-dom or standalone react-reconciler. No dependencies
were installed and no custom React renderer was introduced. Node's existing test
runner cannot mount this React Native provider/consumer tree with those packages.

The provider now delegates each effect's request and returned cleanup function
to startCustomerMenuRequest. Tests exercise that exact production helper and the
real menu adapter/repositories: initial loading/data, failure/retry recovery,
late success/failure after cleanup, out-of-order shop requests, repository changes
and synchronous setup failures. This validates cancellation/publication behavior,
not React mounting, effect dependency scheduling, actual retry-button clicks or
browser interaction. Four consumer tests reuse the existing checkout suite's
React server-rendering approach to render the real Reorder and status components
with supplied context values. They verify loading/error text, disabled actions
(including direct handler guards), status-to-context retry callback wiring,
empty history versus empty menu, and current-price/quantity/availability lookup.
They do not run provider effects or browser click dispatch. A real provider mount,
effect dependency scheduling and an interactive retry/reorder flow remain manual
checks until a supported React mounting environment is available.

## Cart price snapshots: unchanged behavior and live-ordering policy

src/services/cart.ts keeps the product snapshot from the first insertion of an
item ID. Adding the same ID with a changed price increments quantity but retains
the old price; setCartQuantity also retains it. Estimates use that old snapshot.
For example, a dish first added at ₹120 and later re-added at ₹150 results in two
units estimated at ₹120 each. A regression test records this current behavior;
the pricing/checkout implementation has not been changed by the review fixes.

Before live ordering, use a trusted backend quote based on current menu IDs,
revisions, availability, quantities and fulfillment. Compare that quote with cart
snapshots, visibly explain changed prices/unavailable dishes, and require review
of the updated total. Preserve the user's quantities and choices; do not silently
replace prices or remove items. The future order-creation service must revalidate
the accepted quote/revisions atomically (and request review again if they changed).
Never trust the client estimate as an authoritative price. No quote service,
payment or real order creation is introduced in this task.

## Validation after review fixes

- TypeScript (`tsc --noEmit --incremental false`): passed, exit 0.
- Full root suite (`npm run test:auth`, includes menu/request/Reorder/cart tests): 45 passed, 0 failed, exit 0.
- Backend suite (`npm run test:backend`): 63 passed, 0 failed, exit 0.
- Total executed non-emulator tests: 108 passed, 0 failed, 0 skipped.
- `git diff --check`: passed.
- Fresh development web export: passed (924 modules), `/private/tmp/desi-menu-review-fixes.z1ay1s/export`.
- `npm run test:emulator`: stopped at its Java >=21 prerequisite. No emulator tests ran; system Java settings and dependencies were not changed.
- Byte comparisons with base commit 37e4056 confirm the 122-item JSON, image mappings, Home collections, all 139 tracked image assets, cart implementation, Stage 1 repository implementation, app/Firebase rules configuration and dependency files remain unchanged.
