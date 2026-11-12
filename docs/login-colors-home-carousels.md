# Login colors and horizontal Home rows

Home and the dedicated search results screen now reuse the Login palette. The shared Expo implementation covers Web, Android and iOS. The standalone design preview uses the same Login CSS variables.

| Role | Login token | Color |
| --- | --- | --- |
| Page background | parchmentBg | #FFF0D7 |
| Search bars and cards | inputBg | #FFF9EF |
| Buttons and accents | deepMaroon | #861C24 |
| Text | darkBrownText | #542719 |
| Secondary text | darkTerracotta | #7B321F |
| Borders | inputDivider | #D4B8A5 |

Popular Items and Recommended for You each contain six existing catalog entries in separate horizontal rows. `src/data/homeSections.json` supplies the selections to both Expo and the HTML preview. Names, prices and photos still come from the central restaurant menu; no products were duplicated. The rows reuse the existing food card and cart controls. The browser renderer retains each row's horizontal offset during quantity changes. Search results retain their two-column grid.

## Files

Created:
- `src/data/homeSections.json`: shared dish selections for the two Home rows.
- `docs/login-colors-home-carousels.md`: implementation, checks and preview instructions.

Modified:
- `src/theme/homeTheme.ts`: reference Login's existing color tokens.
- `src/screens/HomeScreen.tsx`: horizontal rows, six dishes per row, and themed headings.
- `src/screens/SearchResultsScreen.tsx`: use the shared brown text and search icon colors.
- `src/components/RestaurantFoodCard.tsx`: shared text, button foreground and shadow colors.
- `src/components/Header.tsx`: themed Home search icon.
- `src/components/HomeFoodCategories.tsx`: Login cream for category tiles.
- `assets/menu-preview.js`: load the shared row selections and preserve scroll offsets.
- `assets/menu-preview.css`: scoped Login palette, horizontal rows, and local phone-frame fallback styles.
- `desi-app-preview.html`: horizontal row containers and matching status-bar colors.

The local frame styles preserve the existing preview dimensions when the external utility stylesheet is unavailable. Other prototype screens retain their own palette. There are no dependency, Firebase, authentication or menu-price changes in this feature. Earlier uncommitted auth/OTP work is excluded from the feature commit.

## Verification

- TypeScript passed.
- Four existing menu/search tests passed.
- Both row selections were checked for six unique, available catalog IDs and existing photo files.
- JavaScript syntax and Git whitespace checks passed.
- Expo exports succeeded for Web, Android and iOS.
- Android debug build succeeded, installed and launched on emulator-5554. The app process was running and the error-log check returned no entries.
- Safari design-preview checks confirmed both six-item rows, access to their later dishes, Add/quantity updates, retained horizontal positions, cart totals, matching Home/search colors and the two-column search grid.
- A separate live Expo Web interaction check was interrupted by repeated Safari active-window changes. Native swipe/tap interactions and iOS device appearance were not visually verified. Exports and a successful native launch are not substitutes for those checks.

## Preview and manual checks

- Live shared app: http://localhost:8081
- Home design: http://localhost:4174/desi-app-preview.html?screen=home
- Search design: http://localhost:4174/desi-app-preview.html?screen=search&query=pizza

Reload the browser and Android development app. If Metro is stopped, run `npx expo start --clear --port 8081`; the current local development mock-auth flow uses OTP `123123`. The pre-existing mock-auth changes are separate uncommitted work, so a fresh checkout needs the existing Firebase setup or that separate auth work.

On Android, swipe both Home rows to the end, add a dish, change its quantity and confirm the row stays at that position and the cart count updates. Open search and verify the Login colors, query filtering, Clear and Back. Verify the last card and bottom navigation remain reachable on the smallest target device.

## Git workflow

The branch is based on `feature/desi-menu-search` so it includes the preceding restaurant implementation. Review this change against that branch.

```sh
git fetch origin
git switch -c feature/login-colors-home-carousels
# Stage only the files listed above.
git commit -m "Match Login colors and add horizontal Home dish rows"
git push -u origin feature/login-colors-home-carousels
```
