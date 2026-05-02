import { useEffect, useState } from "react";
import { useAppDispatch } from "@app/hooks";
import { setBoardNotes } from "@features/board";
import { setCaptures } from "@features/quickCapture";
import { setTasks } from "@features/tasks";
import { getBoardNotes } from "@services/firebase/boardNoteService";
import { getCaptures } from "@services/firebase/captureService";
import { getTasks } from "@services/firebase/taskService";

export const FIREBASE_USER_ID = "demo-user";

let hasHydrated = false;

export const useFirebaseHydration = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(!hasHydrated);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (hasHydrated) {
      return;
    }

    let isActive = true;
    hasHydrated = true;

    const hydrate = async () => {
      try {
        const [captures, tasks, boardNotes] = await Promise.all([
          getCaptures(FIREBASE_USER_ID),
          getTasks(FIREBASE_USER_ID),
          getBoardNotes(FIREBASE_USER_ID),
        ]);

        if (!isActive) {
          return;
        }

        dispatch(setCaptures(captures));
        dispatch(setTasks(tasks));
        dispatch(setBoardNotes(boardNotes));
        setError(null);
      } catch (caughtError) {
        const nextError =
          caughtError instanceof Error
            ? caughtError
            : new Error("Firebase hydration failed.");

        console.error("Firebase hydration failed.", nextError);

        if (isActive) {
          setError(nextError);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void hydrate();

    return () => {
      isActive = false;
    };
  }, [dispatch]);

  return { error, isLoading };
};
