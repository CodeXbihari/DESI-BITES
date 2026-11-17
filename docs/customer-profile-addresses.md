# Customer profiles and saved addresses (development milestone)

This extends the approved, uncommitted menu milestone on the same branch. The
menu provider, adapters, tests, catalog, collections and assets remain intact.
Authentication, Firebase configuration/rules, pricing, payment and order-creation
behavior are not replaced or extended with production services.

## Supported Stage 1 operations

- `profile.get()` reads the current SDK user's profile.
- `profile.save({displayName, defaultAddressId})` creates or replaces supported
  profile fields, preserving the repository's createdAt timestamp. There are no
  email, phone, role or profile-delete mutation methods in this milestone.
- `addresses.list()` reads the current user's saved addresses (Stage 1 limit: 100).
- `addresses.save(addressId, input)` creates or updates an address with exactly
  label, addressLine, area, city, pincode and deliveryInstructions.
- `addresses.remove(addressId)` deletes an address and atomically clears the
  profile's defaultAddressId if it referenced that address.

No new repository methods or database fields were introduced. A default address
can be set after explicitly saving a profile. Selecting an address is a session
choice; “Make default” separately persists that choice through profile.save.

## Runtime and ownership

CustomerAccountProvider wraps the existing AppProvider and uses the authenticated
AuthContext UID. Each UID receives its own cached, private Stage 1 demo repository
via createRepositories. It persists across screen changes and sign-out/sign-in
within the current JavaScript runtime; a full reload clears demo data. This is
repository-backed demonstration persistence, not durable production storage.
The UI labels it as local demo data. No sample addresses are preselected or seeded.

The provider optionally accepts an explicit AccountBinding with a repository and
the real Auth SDK current-UID getter. An emulator bootstrap must create that
repository with the existing guarded emulator factory/adapter before Auth
operations and use the same isolated app as Auth. This milestone does not redirect
an existing Firebase Auth session or add automatic emulator bootstrap. Injected
binding failures never select a demo fallback. Release builds are blocked.

The shared customerAccount session store checks the live AuthContext identity and
binding SDK identity before each operation and after asynchronous boundaries. It
also checks a returned profile's document ID, validates repository documents, and
rejects stale completions using a request version. Consumers cannot choose a UID;
selection/default/deletion must reference a loaded own address. Stage 1 derives
Firestore paths from its real SDK UID, and existing Rules enforce ownership.
Client checks do not substitute for Rules or confer production authority.

useSyncExternalStore supplies one immutable snapshot to Profile, Home and Checkout.
A UID or binding change constructs a fresh store during render, so the new render
does not reuse the prior account's snapshot. Old actions are rejected immediately
by the live UID getter; cleanup invalidates pending reads and clears subscriptions.
An already accepted remote transaction cannot be cancelled and may complete for
the original account, but cannot refresh or expose data in the new account UI.

## Profile and address UI

Profile loads repository data and exposes an explicit name editor. Missing data
does not trigger an automatic save or empty-default overwrite. Saves preserve the
loaded default address. Firebase Auth phone/name handling remains unchanged;
the repository name takes precedence in Profile once loaded.

One SavedAddresses component is used by Home's address selector, Profile's existing
Saved Addresses entry and delivery Checkout. It supports add, edit, selection,
default selection and confirmed deletion, with repository reads after mutations.
Address fields are validated with Stage 1's contract: required street/area/city,
valid six-digit PIN starting 1–9, allowed label and bounded field lengths. The
same generated document ID is retained if a form must retry after an ambiguous
write, avoiding a second new address for that form. A new address is selected after
successful save; editing an existing one preserves the current selection.

Loading, missing profile, empty address list, errors and retry are explicit. Writes
are serialized and actions are disabled while loading/saving or after a read error.
If a write or its refresh fails, the UI explains it may have saved and asks for a
reload before another write. Forms remain local drafts only; saved data comes
from the repository. Default-reference and profile/address writes are not a single
combined API: no unsafe fake atomic save is claimed.

## Home and Checkout

The only address store is the customer account session. AppContext exposes derived
legacy address views and a formatted selected-address string for existing cart
labels. It no longer holds INITIAL_ADDRESSES or an independent editable delivery
draft. The unregistered legacy CheckoutModal was made null-safe for an empty list.

Home selection calls the account store directly. Checkout shows that same selected
document and shared saved-address UI. Delivery review requires an available account
snapshot and a selected address that passes Stage 1 validation; loading, saving,
errors, deletion and missing selection prevent review. Pickup needs no address and
still works if address loading fails. Cart/coupon/delivery-fee calculations and the
known price-snapshot policy are unchanged. Checkout remains an estimate review,
with no real payment or order creation.

## Test boundary

Node tests exercise the actual account session store and Stage 1 demo/shared
repositories: load/save, empty data, CRUD/default deletion, validation, retry,
UID scoping, SDK binding mismatch, returned-profile mismatch, guest access,
out-of-order reads and logout/account-switch cleanup (including pending writes).
Server-rendered tests exercise real Profile/address consumers, Home Header and
Checkout, with substituted context inputs. One callback test drives the actual
address selection into the shared session and renders Home and Checkout from its
new snapshot. Checkout tests cover valid saved addresses and pickup versus delivery
under loading/error/saving/invalid-address conditions.

These tests do not mount React effects or certify browser click handling, native
execution, emulator Rules integration or production readiness. Interactive checks
remain necessary for forms, modal scrolling, sign-out/sign-in, account switching
and selected/default address restoration. No dependencies or Java were installed.

## Validation for this milestone

- `tsc --noEmit --incremental false`: passed, exit 0.
- `npm run test:auth` (full root suite): 63 passed, 0 failed, 0 skipped, exit 0.
- `npm run test:backend`: 63 passed, 0 failed, 0 skipped, exit 0.
- Total executed non-emulator tests: 126 passed. This includes 15 new account
  session tests, two new consumer tests and expanded Checkout coverage.
- `git diff --check`: passed.
- Fresh development web export: passed, 927 modules, temporary output at
  `/private/tmp/desi-customer-account.J3Xgn8/export`.
- Existing browser preview remains at `http://localhost:8081`; the updated
  development bundle returned HTTP 200. This does not certify interactive UI flows.
- `npm run test:emulator`: blocked at its Java >=21 prerequisite (exit 1);
  no emulator tests ran and no Java installation/settings change occurred.
- Compared with the task's starting uncommitted snapshot, 16 of the 17 approved
  menu milestone files remain byte-identical. App.tsx preserves its menu wrapper
  and adds the account provider. No previous work was discarded.
- Base comparisons confirm the 122-item JSON, image registry, collections, all
  139 tracked image assets, Auth code, cart pricing implementation, Stage 1
  repository contracts/implementation/validation, Firebase configuration and
  dependency files remain unchanged.

## Targeted review fixes: stale edits and selection recovery

SavedAddressEditor invalidates an edit as soon as a successful account snapshot
no longer contains its ID. It renders no Save action in that state and its effect
closes the form with an explanatory message. Loading/error snapshots do not falsely
invalidate drafts. UI edits use an edit-only session guard against the current own
address list, so even a captured pre-deletion Save callback cannot turn that edit
into a new address. Adds continue to use their original generated ID. This checks
deletions reflected in the shared store; Stage 1's upsert API does not provide a
server-side conditional update for an unseen concurrent remote deletion.

The session retains selection intent separately from cleared loading/error data.
Failed writes, refreshes and retries do not replace it with the profile default.
Only fresh sessions restore defaults automatically. If a selected ID disappears,
the session leaves selection empty and displays a notice requiring selection of an
available address. Later retries do not silently select the default or resurrect
that choice; explicit selection/new-address/default actions clear the notice.
Cleanup clears intent, and only current request versions may remember new intent.

Checkout test helpers now require the review button to exist before checking its
state, with a regression that proves missing buttons fail the assertion.

Validation after these fixes: TypeScript passed; full root suite 75 passed;
backend suite 63 passed; 138 total non-emulator tests passed with no failures or
skips; git diff --check passed. A fresh development web export passed at
`/private/tmp/desi-account-recovery-fixes.H4GIHA/export`. Emulator tests again
stopped at the Java >=21 prerequisite (exit 1); none ran. The regressions exercise
the real session and server-rendered editor with captured callbacks, not mounted
React effects or browser interaction. No configuration, dependency, environment,
catalog, image, pricing or repository-contract changes were made for these fixes.
