import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { setBoardNotes } from "@features/board";
import { setCaptures } from "@features/quickCapture";
import { setRoutineCompletions, setRoutines } from "@features/routines";
import { setTasks } from "@features/tasks";

const hydratedUserIds = new Set<string>();

const isTestEnvironment =
  typeof process !== "undefined" && process.env.NODE_ENV === "test";

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number) => {
  let timeoutId: number | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error("Firebase sync took longer than expected."));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }
};

export const useFirebaseHydration = () => {
  const dispatch = useAppDispatch();
  const { loading: authLoading, user } = useAppSelector((state) => state.auth);
  const userId = user?.uid;
  const [error, setError] = useState<Error | null>(null);
  const shouldHydrate =
    !isTestEnvironment &&
    !authLoading &&
    Boolean(userId) &&
    !hydratedUserIds.has(userId ?? "");

  useEffect(() => {
    if (isTestEnvironment || authLoading || !userId) {
      return;
    }

    if (hydratedUserIds.has(userId)) {
      return;
    }

    let isActive = true;
    hydratedUserIds.add(userId);

    const safetyTimer = window.setTimeout(() => {
      if (!isActive) {
        return;
      }

      setError(new Error("Firebase sync took longer than expected."));
    }, 6500);

    const hydrate = async () => {
      try {
        const [captures, tasks, boardNotes, routines, routineCompletions] =
          await withTimeout(
            Promise.all([
              import("@services/firebase/boardNoteService"),
              import("@services/firebase/captureService"),
              import("@services/firebase/routineService"),
              import("@services/firebase/taskService"),
            ]).then(
              ([
                { getBoardNotes },
                { getCaptures },
                { getRoutineCompletions, getRoutines },
                { getTasks },
              ]) =>
                Promise.all([
                  getCaptures(userId),
                  getTasks(userId),
                  getBoardNotes(userId),
                  getRoutines(userId),
                  getRoutineCompletions(userId),
                ]),
            ),
            6000,
          );

        if (!isActive) {
          return;
        }

        dispatch(setCaptures(captures));
        dispatch(setTasks(tasks));
        dispatch(setBoardNotes(boardNotes));
        dispatch(setRoutines(routines));
        dispatch(setRoutineCompletions(routineCompletions));
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
          window.clearTimeout(safetyTimer);
        }
      }
    };

    void hydrate();

    return () => {
      isActive = false;
      window.clearTimeout(safetyTimer);
    };
  }, [authLoading, dispatch, userId]);

  return { error, isLoading: shouldHydrate };
};
