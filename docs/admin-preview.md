# Desi Bites Admin Frontend Preview

The Admin frontend is a development-only experience that shares the app's React Native screens across Android, iOS, and Expo Web. It uses local demo data and does not authenticate an Admin, access Firebase, or write restaurant/customer records.

## Open the preview

Add this setting to the project root `.env` file:

```env
EXPO_PUBLIC_ADMIN_PREVIEW=1
```

Restart Expo so it reads the new public environment value:

```sh
npx expo start --clear
```

Then open the project in Expo Go or a development build. For the browser, run:

```sh
npx expo start --web --clear
```

The Admin preview replaces the Customer experience only in a development build while the setting is enabled. It does not add a button, link, or Admin tab to the Customer app.

To return to the Customer experience, change the value to `0` or remove it, then restart Expo. The Admin profile's “Exit Admin preview” action also returns to the Customer app for the current runtime session.

## Included demo workflows

- Dashboard metrics, sales chart, popular dishes, recent orders, and restaurant availability.
- Order search/status filters, order details, status changes, and cancellation confirmation.
- Menu search/category filters/sorting, add/edit forms, bundled photo selection, availability, and delete confirmation.
- Category add/edit, image selection, active state, item counts, and guarded deletion.
- Inventory search, stock controls, low-stock/sold-out filters, and availability controls.
- Customer search and customer/order-history details with phone numbers masked.
- Daily/weekly/monthly report views and best-selling items.
- Restaurant profile/settings and mock Admin profile/exit.

Changes are in-memory demo state and reset when the Admin preview is exited or the app reloads. They are intentionally separated from the Firebase architecture so a later backend integration can use an authorized Admin service.

## Important security boundary

This is only a local UI preview. The environment switch is not authentication or authorization and must not be used to protect production Admin data. A production Admin experience needs trusted Firebase sign-in plus server-controlled authorization and security rules.
