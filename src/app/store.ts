import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import {
  addNote,
  boardReducer,
  deleteNote,
  moveNote,
  restoreNote,
  updateNote,
  type BoardNote,
} from "@features/board";
import { focusReducer, type FocusState } from "@features/focus";
import {
  defaultPreferences,
  preferencesReducer,
  type PreferencesState,
} from "@features/preferences";
import {
  addCapture,
  quickCaptureReducer,
  removeCapture,
  restoreCapture,
} from "@features/quickCapture";
import {
  addRoutine,
  completeRoutineForDate,
  deactivateRoutine,
  deleteRoutine,
  getTodayDateKey,
  routinesReducer,
  toggleRoutineChecklistItemForDate,
  updateRoutine,
  type Routine,
  type RoutineCompletion,
} from "@features/routines";
import {
  addTask,
  completeTask,
  deleteTask,
  moveTask,
  restoreTask,
  tasksReducer,
  undoCompleteTask,
  updateTaskPriority,
  updateTask,
  type Task,
} from "@features/tasks";
import { baseApi } from "@services/api/baseApi";
import { FIREBASE_USER_ID } from "@features/persistence/useFirebaseHydration";
import type { CaptureItem } from "@shared/types";

const reducer = {
  board: boardReducer,
  focus: focusReducer,
  preferences: preferencesReducer,
  quickCapture: quickCaptureReducer,
  routines: routinesReducer,
  tasks: tasksReducer,
  [baseApi.reducerPath]: baseApi.reducer,
};

const STORAGE_KEY = "milo:state:v1";

type PersistedState = {
  board?: {
    notes?: BoardNote[];
  };
  focus?: Partial<FocusState>;
  preferences?: Partial<PreferencesState>;
  quickCapture?: {
    items?: CaptureItem[];
  };
  routines?: {
    routines?: Routine[];
    completions?: RoutineCompletion[];
  };
  tasks?: {
    items?: Array<Omit<Task, "order"> & { order?: number }>;
  };
};

const readPersistedState = (): PersistedState | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return undefined;
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!parsedValue || typeof parsedValue !== "object") {
      return undefined;
    }

    return parsedValue;
  } catch {
    return undefined;
  }
};

const buildPreloadedState = () => {
  const persistedState = readPersistedState();

  if (!persistedState) {
    return undefined;
  }

  const tasks = Array.isArray(persistedState.tasks?.items)
    ? persistedState.tasks.items.map((task, index) => ({
        ...task,
        order: typeof task.order === "number" ? task.order : index + 1,
      }))
    : [];

  const captures = Array.isArray(persistedState.quickCapture?.items)
    ? persistedState.quickCapture.items
    : [];
  const boardNotes = Array.isArray(persistedState.board?.notes)
    ? persistedState.board.notes.filter(
        (note) =>
          typeof note.id === "string" &&
          typeof note.content === "string" &&
          typeof note.x === "number" &&
          typeof note.y === "number",
      )
    : [];
  const preferences = persistedState.preferences
    ? {
        ...defaultPreferences,
        ...persistedState.preferences,
        mustDoLimit:
          typeof persistedState.preferences.mustDoLimit === "number"
            ? Math.min(5, Math.max(1, persistedState.preferences.mustDoLimit))
            : defaultPreferences.mustDoLimit,
      }
    : defaultPreferences;
  const routines = Array.isArray(persistedState.routines?.routines)
    ? persistedState.routines.routines
    : [];
  const completions = Array.isArray(persistedState.routines?.completions)
    ? persistedState.routines.completions
    : [];

  return {
    board: {
      notes: boardNotes,
    },
    focus: {
      currentTaskId: persistedState.focus?.currentTaskId ?? null,
      lastSwappedTaskId: persistedState.focus?.lastSwappedTaskId ?? null,
      skippedTaskIds: Array.isArray(persistedState.focus?.skippedTaskIds)
        ? persistedState.focus.skippedTaskIds
        : [],
      startedAt: persistedState.focus?.startedAt ?? null,
    },
    preferences,
    quickCapture: {
      items: captures,
    },
    routines: {
      routines,
      completions,
    },
    tasks: {
      items: tasks,
    },
  };
};

const persistenceMiddleware = createListenerMiddleware();

export const store = configureStore({
  reducer,
  preloadedState: buildPreloadedState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      baseApi.middleware,
      persistenceMiddleware.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

const startAppListening = persistenceMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>();

startAppListening({
  actionCreator: addCapture,
  effect: async (action) => {
    try {
      const { saveCapture } = await import("@services/firebase/captureService");
      await saveCapture(FIREBASE_USER_ID, action.payload);
    } catch (error) {
      console.error("Failed to save capture.", error);
    }
  },
});

startAppListening({
  actionCreator: restoreCapture,
  effect: async (action) => {
    try {
      const { saveCapture } = await import("@services/firebase/captureService");
      await saveCapture(FIREBASE_USER_ID, action.payload.item);
    } catch (error) {
      console.error("Failed to save capture.", error);
    }
  },
});

startAppListening({
  actionCreator: removeCapture,
  effect: async (action) => {
    try {
      const { deleteCapture } =
        await import("@services/firebase/captureService");
      await deleteCapture(FIREBASE_USER_ID, action.payload);
    } catch (error) {
      console.error("Failed to delete capture.", error);
    }
  },
});

const saveCurrentTask = async (taskId: string) => {
  const task = store.getState().tasks.items.find((item) => item.id === taskId);

  if (!task) {
    return;
  }

  try {
    const { saveTask } = await import("@services/firebase/taskService");
    await saveTask(FIREBASE_USER_ID, task);
  } catch (error) {
    console.error("Failed to save task.", error);
  }
};

startAppListening({
  actionCreator: addTask,
  effect: async (action) => {
    await saveCurrentTask(action.payload.id);
  },
});

startAppListening({
  actionCreator: completeTask,
  effect: async (action) => {
    await saveCurrentTask(action.payload);
  },
});

startAppListening({
  actionCreator: undoCompleteTask,
  effect: async (action) => {
    await saveCurrentTask(action.payload);
  },
});

startAppListening({
  actionCreator: updateTaskPriority,
  effect: async (action) => {
    await saveCurrentTask(action.payload.id);
  },
});

startAppListening({
  actionCreator: updateTask,
  effect: async (action) => {
    await saveCurrentTask(action.payload.id);
  },
});

startAppListening({
  actionCreator: restoreTask,
  effect: async (action) => {
    await saveCurrentTask(action.payload.task.id);
  },
});

startAppListening({
  actionCreator: moveTask,
  effect: async () => {
    const tasks = store.getState().tasks.items;

    try {
      const { saveTask } = await import("@services/firebase/taskService");
      await Promise.all(tasks.map((task) => saveTask(FIREBASE_USER_ID, task)));
    } catch (error) {
      console.error("Failed to save task order.", error);
    }
  },
});

startAppListening({
  actionCreator: deleteTask,
  effect: async (action) => {
    try {
      const { deleteTask: deleteFirebaseTask } =
        await import("@services/firebase/taskService");
      await deleteFirebaseTask(FIREBASE_USER_ID, action.payload);
    } catch (error) {
      console.error("Failed to delete task.", error);
    }
  },
});

const saveCurrentRoutine = async (routineId: string) => {
  const routine = store
    .getState()
    .routines.routines.find((item) => item.id === routineId);

  if (!routine) {
    return;
  }

  try {
    const { saveRoutine } = await import("@services/firebase/routineService");
    await saveRoutine(FIREBASE_USER_ID, routine);
  } catch (error) {
    console.error("Failed to save routine.", error);
  }
};

const saveCurrentRoutineCompletion = async (
  routineId: string,
  date: string,
) => {
  const completion = store
    .getState()
    .routines.completions.find(
      (item) => item.routineId === routineId && item.date === date,
    );

  if (!completion) {
    return;
  }

  try {
    const { saveRoutineCompletion } =
      await import("@services/firebase/routineService");
    await saveRoutineCompletion(FIREBASE_USER_ID, completion);
  } catch (error) {
    console.error("Failed to save routine completion.", error);
  }
};

startAppListening({
  actionCreator: addRoutine,
  effect: async (action) => {
    await saveCurrentRoutine(action.payload.id);
  },
});

startAppListening({
  actionCreator: updateRoutine,
  effect: async (action) => {
    await saveCurrentRoutine(action.payload.id);
  },
});

startAppListening({
  actionCreator: deactivateRoutine,
  effect: async (action) => {
    await saveCurrentRoutine(action.payload);
  },
});

startAppListening({
  actionCreator: deleteRoutine,
  effect: async (action, listenerApi) => {
    const originalState = listenerApi.getOriginalState();
    const originalCompletions = originalState.routines.completions.filter(
      (completion) => completion.routineId === action.payload,
    );

    try {
      const { deleteRoutine: deleteFirebaseRoutine, deleteRoutineCompletion } =
        await import("@services/firebase/routineService");
      await deleteFirebaseRoutine(FIREBASE_USER_ID, action.payload);
      await Promise.all(
        originalCompletions.map((completion) =>
          deleteRoutineCompletion(
            FIREBASE_USER_ID,
            completion.routineId,
            completion.date,
          ),
        ),
      );
    } catch (error) {
      console.error("Failed to delete routine.", error);
    }
  },
});

startAppListening({
  actionCreator: toggleRoutineChecklistItemForDate,
  effect: async (action) => {
    await saveCurrentRoutineCompletion(
      action.payload.routineId,
      action.payload.date ?? getTodayDateKey(),
    );
  },
});

startAppListening({
  actionCreator: completeRoutineForDate,
  effect: async (action) => {
    await saveCurrentRoutineCompletion(
      action.payload.routineId,
      action.payload.date ?? getTodayDateKey(),
    );
  },
});

const saveCurrentBoardNote = async (noteId: string) => {
  const note = store.getState().board.notes.find((item) => item.id === noteId);

  if (!note) {
    return;
  }

  try {
    const { saveBoardNote } =
      await import("@services/firebase/boardNoteService");
    await saveBoardNote(FIREBASE_USER_ID, note);
  } catch (error) {
    console.error("Failed to save board note.", error);
  }
};

startAppListening({
  actionCreator: addNote,
  effect: async (action) => {
    await saveCurrentBoardNote(action.payload.id);
  },
});

startAppListening({
  actionCreator: restoreNote,
  effect: async (action) => {
    await saveCurrentBoardNote(action.payload.note.id);
  },
});

startAppListening({
  actionCreator: moveNote,
  effect: async (action) => {
    await saveCurrentBoardNote(action.payload.id);
  },
});

startAppListening({
  actionCreator: updateNote,
  effect: async (action) => {
    await saveCurrentBoardNote(action.payload.id);
  },
});

startAppListening({
  actionCreator: deleteNote,
  effect: async (action) => {
    try {
      const { deleteBoardNote } =
        await import("@services/firebase/boardNoteService");
      await deleteBoardNote(FIREBASE_USER_ID, action.payload);
    } catch (error) {
      console.error("Failed to delete board note.", error);
    }
  },
});

if (typeof window !== "undefined") {
  store.subscribe(() => {
    const state = store.getState();

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        focus: state.focus,
        preferences: state.preferences,
        board: state.board,
        quickCapture: state.quickCapture,
        routines: state.routines,
        tasks: state.tasks,
      }),
    );
  });
}
