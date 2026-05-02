import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import type { Task } from "@features/tasks";
import { db } from "./firebaseClient";
import { getTasksPath } from "./paths";
import { normalizeDateFields } from "./serializers";

const ensureDb = () => {
  if (!db) {
    throw new Error("Firebase is not configured.");
  }

  return db;
};

export const getTasks = async (userId: string): Promise<Task[]> => {
  const snapshot = await getDocs(collection(ensureDb(), getTasksPath(userId)));

  return snapshot.docs.map((taskDoc) => {
    const data = normalizeDateFields(taskDoc.data());

    return {
      ...data,
      id: typeof data.id === "string" ? data.id : taskDoc.id,
    } as Task;
  });
};

export const saveTask = async (userId: string, task: Task): Promise<void> => {
  await setDoc(doc(ensureDb(), getTasksPath(userId), task.id), task);
};

export const deleteTask = async (
  userId: string,
  taskId: string,
): Promise<void> => {
  await deleteDoc(doc(ensureDb(), getTasksPath(userId), taskId));
};
