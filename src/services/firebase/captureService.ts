import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import type { CaptureItem } from "@shared/types";
import { db } from "./firebaseClient";
import { getCapturesPath } from "./paths";
import { normalizeDateFields } from "./serializers";

const ensureDb = () => {
  if (!db) {
    throw new Error("Firebase is not configured.");
  }

  return db;
};

export const getCaptures = async (userId: string): Promise<CaptureItem[]> => {
  const snapshot = await getDocs(
    collection(ensureDb(), getCapturesPath(userId)),
  );

  return snapshot.docs.map((captureDoc) => {
    const data = normalizeDateFields(captureDoc.data());

    return {
      ...data,
      id: typeof data.id === "string" ? data.id : captureDoc.id,
    } as CaptureItem;
  });
};

export const saveCapture = async (
  userId: string,
  capture: CaptureItem,
): Promise<void> => {
  await setDoc(doc(ensureDb(), getCapturesPath(userId), capture.id), capture);
};

export const deleteCapture = async (
  userId: string,
  captureId: string,
): Promise<void> => {
  await deleteDoc(doc(ensureDb(), getCapturesPath(userId), captureId));
};
