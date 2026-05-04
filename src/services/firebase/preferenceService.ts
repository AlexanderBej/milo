import { doc, getDoc, setDoc } from "firebase/firestore";
import type { PreferencesState } from "@features/preferences";
import { db } from "./firebaseClient";
import { getMainPreferencesPath } from "./paths";
import { removeUndefinedFields } from "./serializers";

const ensureDb = () => {
  if (!db) {
    throw new Error("Firebase is not configured.");
  }

  return db;
};

export const getPreferences = async (
  userId: string,
): Promise<Partial<PreferencesState> | undefined> => {
  const snapshot = await getDoc(
    doc(ensureDb(), getMainPreferencesPath(userId)),
  );

  if (!snapshot.exists()) {
    return undefined;
  }

  return snapshot.data();
};

export const savePreferences = async (
  userId: string,
  preferences: PreferencesState,
): Promise<void> => {
  console.log("Writing preferences");
  await setDoc(
    doc(ensureDb(), getMainPreferencesPath(userId)),
    removeUndefinedFields(preferences),
  );
};
