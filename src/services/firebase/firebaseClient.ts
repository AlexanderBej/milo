import { initializeApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const getEnvValue = (value: unknown) => {
  return typeof value === "string" ? value : "";
};

const firebaseConfig = {
  apiKey: getEnvValue(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: getEnvValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: getEnvValue(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: getEnvValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: getEnvValue(
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  ),
  appId: getEnvValue(import.meta.env.VITE_FIREBASE_APP_ID),
};

const requiredConfigValues = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
];

export const app = requiredConfigValues.some((value) => !value)
  ? null
  : initializeApp(firebaseConfig);

export const db: Firestore | null = app ? getFirestore(app) : null;

if (!app) {
  console.warn("Firebase config is missing. Persistence is disabled.");
}
