import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  type QueryDocumentSnapshot,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import type { BoardArea } from "@features/board";
import { db } from "./firebaseClient";
import { getBoardAreasPath } from "./paths";
import { removeUndefinedFields } from "./serializers";

const ensureDb = () => {
  if (!db) {
    throw new Error("Firebase is not configured.");
  }

  return db;
};

const toBoardArea = (areaDoc: QueryDocumentSnapshot): BoardArea => {
  const data = areaDoc.data();

  return {
    ...data,
    id: typeof data.id === "string" ? data.id : areaDoc.id,
  } as BoardArea;
};

export const getBoardAreas = async (userId: string): Promise<BoardArea[]> => {
  const snapshot = await getDocs(
    collection(ensureDb(), getBoardAreasPath(userId)),
  );

  return snapshot.docs.map(toBoardArea);
};

export const subscribeBoardAreas = (
  userId: string,
  onBoardAreas: (areas: BoardArea[]) => void,
): Unsubscribe => {
  return onSnapshot(
    collection(ensureDb(), getBoardAreasPath(userId)),
    (snap) => {
      onBoardAreas(snap.docs.map(toBoardArea));
    },
  );
};

export const saveBoardArea = async (
  userId: string,
  boardArea: BoardArea,
): Promise<void> => {
  await setDoc(
    doc(ensureDb(), getBoardAreasPath(userId), boardArea.id),
    removeUndefinedFields(boardArea),
  );
};

export const deleteBoardArea = async (
  userId: string,
  boardAreaId: string,
): Promise<void> => {
  await deleteDoc(doc(ensureDb(), getBoardAreasPath(userId), boardAreaId));
};
