# Admin dashboard development access

Admin entry now requires Firebase Phone Authentication and an Admin custom claim. The old `EXPO_PUBLIC_ADMIN_PREVIEW=1` automatic entry is disabled. See [secure-admin-auth.md](secure-admin-auth.md) for the Firebase test-phone setup, separate Admin URL, native development build instructions, and Firestore rules integration.

Dashboard content remains local demo data and resets when the app reloads. No Admin UI actions currently write to Firebase.
