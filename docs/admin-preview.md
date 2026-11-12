# Desi Bites Admin Frontend Preview

The Admin frontend is a development-only experience that shares React Native screens across Android, iOS, and Expo Web. It uses a fictional local Admin session and demo data. It does not use Firebase Authentication, access Firestore, or write restaurant/customer records.

## Open the preview

Add this setting to the project root `.env` file:

```env
EXPO_PUBLIC_ADMIN_PREVIEW=1
```

Restart Expo so it reads the development setting:

```sh
npx expo start --clear
```

For browser preview, start the Expo Web development server:

```sh
npx expo start --web --clear
```

In the running app, the **Developer Tools** screen appears. Select **Open Admin Preview** to open the Admin Dashboard. In Admin Profile, **Exit Admin preview** returns to Developer Tools. Select **Exit developer tools** to return to the Customer app.

Use the Expo development server for this preview. A production/static export has `__DEV__` disabled and intentionally does not expose the Developer Tools entry. The route is implemented with the existing React Navigation stack; this project does not use Expo Router.

To remove the Developer Tools screen, change the flag to `0` or remove it, then restart Expo. The entry is guarded by `__DEV__` and is unavailable in production builds.

## Included demo workflows

- Dashboard metrics, sales chart, popular dishes, recent orders, and restaurant availability.
- Order search/status filters, order details, status changes, and cancellation confirmation.
- Menu search/category filters/sorting, add/edit forms, bundled photo selection, availability, and delete confirmation.
- Category add/edit, image selection, active state, item counts, and guarded deletion.
- Inventory search, stock controls, low-stock/sold-out filters, and availability controls.
- Customer search and customer/order-history details with phone numbers masked.
- Daily/weekly/monthly report views and best-selling items.
- Restaurant profile/settings and mock Admin profile/exit.

Changes are in-memory demo state and reset when the Admin preview is exited or the app reloads. They remain separate from the Firebase authentication and future Admin authorization services.

## Important security boundary

This is only a local UI preview. The environment switch and mock session are not authentication or authorization and must not protect production Admin data. The preview is never included in production builds. A production Admin experience needs trusted Firebase sign-in plus server-controlled authorization and security rules.
