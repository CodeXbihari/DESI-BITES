# Staff login and delivery demo

Run these commands from this checkout. This demo uses the existing Desi Bites login screen for all roles. If another Expo server is running, stop it first or choose a free port.

Web:

```sh
npx expo start --web --clear
```

Open the customer app's normal login screen at the web address printed by Expo.

Android and iOS:

```sh
npx expo start --clear
```

Open the project in a compatible Expo client or development build. Press `a` or `i` in the Expo terminal with an emulator or simulator configured.

| Demo account | Mobile | Login method |
| --- | --- | --- |
| Admin | Enter the last 10 digits of `EXPO_PUBLIC_ADMIN_DEMO_PHONE` from `.env` | Existing OTP screen; use `EXPO_PUBLIC_ADMIN_DEMO_OTP` |
| Seeded delivery partner | 8888888888 | 654321 PIN |
| Inactive delivery partner | 7777777777 | 456789 PIN (sign-in is rejected) |

Enable mock authentication in development with `EXPO_PUBLIC_AUTH_MODE=mock`. The Admin enters their phone on the existing login screen and verifies through the existing OTP screen. In Admin, open **Delivery** from the sidebar or mobile **Tools** menu. Add a partner and assign a six-digit PIN. Log out through Admin **Profile**; the same login screen detects that partner's phone and shows the PIN field. A successful PIN opens the Delivery dashboard. The seeded delivery account has orders to try the four status actions. Newly created accounts start with no assigned orders.

Browser data and the session persist per origin in localStorage. Native data and the session persist per installation in AsyncStorage. Demo accounts and changes do not sync between devices or browser profiles. Sign out to switch accounts on the same installation. Clear this app's local data to restore the seed.

Delivery PIN sign-in and Admin demo sessions are development-only. Do not use local demo PINs as production authentication. For real delivery accounts and roles, add trusted backend authentication and authorization before production. Customer sign-in keeps its existing OTP flow.
