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

const createFirestore = (): Firestore | null => {
  if (requiredConfigValues.some((value) => !value)) {
    console.warn("Firebase config is missing. Persistence is disabled.");
    return null;
  }

  const app = initializeApp(firebaseConfig);

  return getFirestore(app);
};

export const db = createFirestore();
