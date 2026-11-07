import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export function getWebAuth() {
  const config = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
  if (Object.values(config).some(value => !value)) {
    throw new Error('Firebase web configuration is missing. Fill in .env using .env.example and restart Expo.');
  }
  return getAuth(getApps().length ? getApp() : initializeApp(config));
}
