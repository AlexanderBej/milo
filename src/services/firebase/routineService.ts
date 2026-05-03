import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import type { Routine, RoutineCompletion } from "@features/routines";
import { db } from "./firebaseClient";
import { getRoutineCompletionsPath, getRoutinesPath } from "./paths";
import { normalizeDateFields } from "./serializers";

const ensureDb = () => {
  if (!db) {
    throw new Error("Firebase is not configured.");
  }

  return db;
};

export const getRoutines = async (userId: string): Promise<Routine[]> => {
  const snapshot = await getDocs(
    collection(ensureDb(), getRoutinesPath(userId)),
  );

  return snapshot.docs.map((routineDoc) => {
    const data = normalizeDateFields(routineDoc.data());

    return {
      ...data,
      id: typeof data.id === "string" ? data.id : routineDoc.id,
    } as Routine;
  });
};

export const saveRoutine = async (
  userId: string,
  routine: Routine,
): Promise<void> => {
  await setDoc(doc(ensureDb(), getRoutinesPath(userId), routine.id), routine);
};

export const deleteRoutine = async (
  userId: string,
  routineId: string,
): Promise<void> => {
  await deleteDoc(doc(ensureDb(), getRoutinesPath(userId), routineId));
};

export const getRoutineCompletions = async (
  userId: string,
): Promise<RoutineCompletion[]> => {
  const snapshot = await getDocs(
    collection(ensureDb(), getRoutineCompletionsPath(userId)),
  );

  return snapshot.docs.map((completionDoc) => {
    const data = normalizeDateFields(completionDoc.data());

    return {
      ...data,
    } as RoutineCompletion;
  });
};

export const saveRoutineCompletion = async (
  userId: string,
  completion: RoutineCompletion,
): Promise<void> => {
  await setDoc(
    doc(
      ensureDb(),
      getRoutineCompletionsPath(userId),
      `${completion.routineId}_${completion.date}`,
    ),
    completion,
  );
};

export const deleteRoutineCompletion = async (
  userId: string,
  routineId: string,
  date: string,
): Promise<void> => {
  await deleteDoc(
    doc(ensureDb(), getRoutineCompletionsPath(userId), `${routineId}_${date}`),
  );
};
