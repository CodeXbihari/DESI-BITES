# Staff login and delivery demo

Run these commands from this checkout. If another Expo server is running, stop it first or choose a free port.

Web:

```sh
EXPO_PUBLIC_STAFF_DEMO=1 npx expo start --web --clear
```

Open [http://localhost:8081/login](http://localhost:8081/login), or use the port Metro prints.

Android and iOS:

```sh
EXPO_PUBLIC_STAFF_DEMO=1 npx expo start --clear
```

Open the project in a compatible Expo client or development build. Press `a` or `i` in the Expo terminal with an emulator or simulator configured.

| Demo account | Mobile | PIN |
| --- | --- | --- |
| Admin | 9999999999 | 123456 |
| Delivery Partner | 8888888888 | 654321 |
| Inactive Delivery Partner | 7777777777 | 456789 |

Admin opens the existing dashboard. Select **Delivery** in the sidebar or mobile **Tools** menu. Add a partner, note their mobile and PIN, and log out through the Admin **Profile**. Sign in through the same form. The seeded delivery account has orders to try the four status actions. Newly created accounts start with no assigned orders.

Browser data and the session persist per origin in localStorage. Native data and the session persist per installation in AsyncStorage. Demo accounts and changes do not sync between devices or browser profiles. Sign out to switch accounts on the same installation. Clear this app's local data to restore the seed.

This entry is enabled by the development flag and `__DEV__`. Launch Expo without the flag to use the existing customer flow or the existing Admin preview setting. The three browser paths are served by Expo's development server. Native uses the same guarded screens without depending on a browser URL.
