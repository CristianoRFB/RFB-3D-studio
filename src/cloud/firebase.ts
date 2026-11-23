import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';

export type CloudServices = { app: FirebaseApp; auth: Auth; db: Firestore };
let singleton: CloudServices | null = null;

const publicConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
};
export function isCloudConfigured(): boolean {
  return Object.values(publicConfig).every(x => typeof x === 'string' && x.trim().length > 0);
}
export function cloudServices(): CloudServices | null {
  if (!isCloudConfigured()) return null;
  if (singleton) return singleton;
  const app = getApps()[0] ?? initializeApp(publicConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  // Never auto-connect to local emulators in a production build.
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  }
  singleton = { app, auth, db };
  return singleton;
}
