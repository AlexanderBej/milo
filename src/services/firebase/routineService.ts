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
import { normalizeDateFields, removeUndefinedFields } from "./serializers";

const ensureDb = () => {
  if (!db) {
    throw new Error("Firebase is not configured.");
  }

  return db;
};

const toUnknownRecord = (data: unknown): Record<string, unknown> => {
  if (!data || typeof data !== "object") {
    return {};
  }

  return data as Record<string, unknown>;
};

export const getRoutines = async (userId: string): Promise<Routine[]> => {
  const snapshot = await getDocs(
    collection(ensureDb(), getRoutinesPath(userId)),
  );

  return snapshot.docs.map((routineDoc) => {
    const data = normalizeDateFields(toUnknownRecord(routineDoc.data()));
    const checklist = Array.isArray(data.checklist)
      ? data.checklist.filter(
          (item): item is string => typeof item === "string",
        )
      : [];

    return {
      ...data,
      id: typeof data.id === "string" ? data.id : routineDoc.id,
      active: data.active ?? true,
      checklist,
      schedule: data.schedule === "weekly" ? "weekly" : "daily",
    } as Routine;
  });
};

export const saveRoutine = async (
  userId: string,
  routine: Routine,
): Promise<void> => {
  await setDoc(
    doc(ensureDb(), getRoutinesPath(userId), routine.id),
    removeUndefinedFields(routine),
  );
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
    const data = normalizeDateFields(toUnknownRecord(completionDoc.data()));
    const periodKey =
      typeof data.periodKey === "string"
        ? data.periodKey
        : typeof data.date === "string"
          ? data.date
          : "";
    const completedChecklistItems = Array.isArray(data.completedChecklistItems)
      ? data.completedChecklistItems.filter(
          (item): item is string => typeof item === "string",
        )
      : [];

    return {
      ...data,
      id:
        typeof data.id === "string"
          ? data.id
          : `${String(data.routineId)}_${periodKey}`,
      periodKey,
      completedChecklistItems,
    } as RoutineCompletion;
  });
};

export const saveRoutineCompletion = async (
  userId: string,
  completion: RoutineCompletion,
): Promise<void> => {
  await setDoc(
    doc(ensureDb(), getRoutineCompletionsPath(userId), completion.id),
    removeUndefinedFields(completion),
  );
};

export const deleteRoutineCompletion = async (
  userId: string,
  completionId: string,
): Promise<void> => {
  await deleteDoc(
    doc(ensureDb(), getRoutineCompletionsPath(userId), completionId),
  );
};
