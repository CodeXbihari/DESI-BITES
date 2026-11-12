# Desi Bites Home and food search

The approved restaurant Home and search results design is implemented in the shared Expo application (Android, iOS and Web) and the standalone HTML design preview.

## Menu and photos

`src/data/restaurantMenu.json` is the single restaurant catalog: 122 entries transcribed from `desi-bites-menu-reference.jpeg`. It supplies IDs, names, categories, prices, local photo paths, vegetarian flags, availability, descriptions and seasonal/serving notes. The menu photo overrides conflicting mockup prices, including Paneer Pizza ₹190, Tomato Pizza ₹120 and Pineapple Pizza ₹160. The printed special pizza/juice combo numeric price is ₹300.

Descriptions are neutral category descriptions because recipes were not supplied. Availability is editable local catalog data, initially true for listed dishes; this is not live restaurant stock. Seasonal and tea/coffee serving-hour notes are retained. There is no existing Firestore menu integration in this checkout; Firebase authentication remains unchanged and no collection or production data was written.

`menuImages.ts` registers local images for Metro. `restaurantMenu.ts` resolves those assets and adapts restaurant items to the existing cart product contract. Both the app and `assets/menu-preview.js` read the same catalog. There is no independently maintained browser menu list.

The 70 food images in `assets/images/menu/` are representative AI-generated dish photography, not photographs supplied by the restaurant. Related variations share photos where appropriate. Separate photo mappings cover paneer/mushroom/corn dishes, fruit juices, lassi flavors, sides and combos. The transparent wordmark at `assets/images/desi-logo.png` was derived from the supplied menu logo. The built-in image generation tool was used; prompt subjects and the common photography specification are recorded in `menu-image-prompts.json`. Final assets are stored locally and require no external image service at runtime.

## Search and cart

Home search and Menu search open `SearchResultsScreen`, passing an initial query. Results use trimmed, case-insensitive partial food-name matching across every restaurant category, including matching combos. Empty queries show a prompt with no suggested products. No-match queries show an empty state. Categories, recommendations and promotional content stay outside the search results screen.

`RestaurantFoodCard` is shared between Home and search. Add, plus and minus use the existing AppContext cart. The Menu screen's former independent cart is replaced with that shared state. Cart, checkout and tracking modals are mounted once at app scope so search can open the existing cart without routing into the separate demonstration checkout screen. Back returns to the preceding route. Existing auth/OTP work is preserved.

The HTML prototype has the same source menu and quantity behavior. Its checkout totals follow the app's existing rules: ₹35 delivery below ₹499, free delivery at ₹499 or with DESIEXPRESS, FESTIVE40 and SPICE20 discounts, and no added handling charge. The primary HTML preview embeds the actual Expo Web application.

## Preview

From the project root, run `npx expo start --clear --port 8081`. Press `w` for Web, or connect the Android preview through the displayed QR/development-build link. `EXPO_PUBLIC_AUTH_MODE=mock` enables the existing development-only Web/Android flow; demo OTP is `123123`.

Open http://localhost:8081 for the shared app. Serve the repository with `python3 -m http.server 4174 --bind 127.0.0.1`, then open http://localhost:4174/desi-app-preview.html for the live app wrapper and optional design mockup. Use HTTP rather than opening the HTML via file:// because the design mockup loads the catalog JSON.

When adding catalog images, add their local require mapping to `menuImages.ts`. Changes to names/prices in the JSON are read by both platforms. `scripts/build_preview.js` is an older one-off generator that predates the current screens; do not use it to overwrite the maintained HTML preview.

## Verification

- TypeScript and whitespace checks.
- Menu/search tests: unique identities, positive prices, existing photo assets, source-menu price corrections, cross-category Paneer matches, case/partial matching, clear and no-match behavior.
- Existing authentication tests.
- Expo exports for Web, Android and iOS.
- Interactive Safari checks of Home, search, Add/plus/minus, Clear, no-match state, Back and the shared cart.
- Standalone preview checks of Home, Maggi search, quantities and checkout item consistency.

The Android debug build succeeded, installed and launched on emulator-5554. The com.desi.app process was running and the Android error-log check returned no entries. Computer Use could not access the emulator window, so native tap flows and visual layout still need a manual device check. iOS was exported, not installed on an iOS device.

The current local mock-auth edits and 30-second OTP change predate this feature and remain uncommitted; they are deliberately excluded from the feature commit. A fresh checkout must use the existing Firebase configuration or integrate that separate authentication work to use the mock sign-in instructions above.

## Files in this feature

Modified:
- `App.tsx`: dedicated search route, Menu search entry, global shared-cart modals and safe-area-aware navigation/cart clearance.
- `src/screens/HomeScreen.tsx`: approved restaurant Home layout.
- `src/components/Header.tsx`: restaurant branding, location/cart and search entry.
- `src/components/HomeFoodCategories.tsx`: horizontal menu-backed category photography.
- `src/components/CartFloatingBar.tsx`: correct subtotal and measured navigation clearance.
- `src/components/CartModal.tsx`: accessible close button.
- `src/screens/SearchMenuScreen.tsx`: central menu, shared cart and dedicated search entry.
- `src/data/searchMenuData.ts`: preserve screen theme/artwork exports and replace the old restaurant list with the central catalog export.
- `src/theme/homeTheme.ts`: approved cream/maroon restaurant palette.
- `desi-app-preview.html`: matching Home/search and catalog-driven cart/checkout with direct design links.

Created:
- `src/screens/SearchResultsScreen.tsx`
- `src/components/RestaurantFoodCard.tsx`
- `src/services/menuSearch.ts`
- `src/data/restaurantMenu.json`
- `src/data/restaurantMenu.ts`
- `src/data/menuImages.ts`
- `tests/menuSearch.test.mjs`
- `assets/menu-preview.css`
- `assets/menu-preview.js`
- `assets/images/desi-logo.png`
- 70 JPEGs under `assets/images/menu/`; every exact path is listed in `docs/menu-image-prompts.json`.
- `docs/desi-bites-menu-reference.jpeg`
- `docs/menu-image-prompts.json`
- `docs/home-search.md`

No dependency or package-lock changes were needed. Local planning/photo-review HTML files under `work/previews/` are review aids and are not part of the app.
