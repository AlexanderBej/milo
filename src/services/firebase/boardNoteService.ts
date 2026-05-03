import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import type { BoardNote } from "@features/board";
import { db } from "./firebaseClient";
import { getBoardNotesPath } from "./paths";
import { normalizeDateFields, removeUndefinedFields } from "./serializers";

const ensureDb = () => {
  if (!db) {
    throw new Error("Firebase is not configured.");
  }

  return db;
};

export const getBoardNotes = async (userId: string): Promise<BoardNote[]> => {
  const snapshot = await getDocs(
    collection(ensureDb(), getBoardNotesPath(userId)),
  );

  return snapshot.docs.map((noteDoc) => {
    const data = normalizeDateFields(noteDoc.data());

    return {
      ...data,
      id: typeof data.id === "string" ? data.id : noteDoc.id,
    } as BoardNote;
  });
};

export const saveBoardNote = async (
  userId: string,
  boardNote: BoardNote,
): Promise<void> => {
  await setDoc(
    doc(ensureDb(), getBoardNotesPath(userId), boardNote.id),
    removeUndefinedFields(boardNote),
  );
};

export const deleteBoardNote = async (
  userId: string,
  boardNoteId: string,
): Promise<void> => {
  await deleteDoc(doc(ensureDb(), getBoardNotesPath(userId), boardNoteId));
};
