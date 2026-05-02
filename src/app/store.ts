import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import {
  addNote,
  boardReducer,
  deleteNote,
  moveNote,
  updateNote,
  type BoardNote,
} from "@features/board";
import { focusReducer, type FocusState } from "@features/focus";
import {
  addCapture,
  quickCaptureReducer,
  removeCapture,
  restoreCapture,
} from "@features/quickCapture";
import {
  addTask,
  completeTask,
  deleteTask,
  moveTask,
  restoreTask,
  tasksReducer,
  undoCompleteTask,
  updateTaskPriority,
  type Task,
} from "@features/tasks";
import { baseApi } from "@services/api/baseApi";
import {
  deleteBoardNote,
  saveBoardNote,
} from "@services/firebase/boardNoteService";
import { deleteCapture, saveCapture } from "@services/firebase/captureService";
import {
  deleteTask as deleteFirebaseTask,
  saveTask,
} from "@services/firebase/taskService";
import { FIREBASE_USER_ID } from "@features/persistence/useFirebaseHydration";
import type { CaptureItem } from "@shared/types";

const reducer = {
  board: boardReducer,
  focus: focusReducer,
  quickCapture: quickCaptureReducer,
  tasks: tasksReducer,
  [baseApi.reducerPath]: baseApi.reducer,
};

const STORAGE_KEY = "milo:state:v1";

type PersistedState = {
  board?: {
    notes?: BoardNote[];
  };
  focus?: Partial<FocusState>;
  quickCapture?: {
    items?: CaptureItem[];
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
    quickCapture: {
      items: captures,
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
      await deleteFirebaseTask(FIREBASE_USER_ID, action.payload);
    } catch (error) {
      console.error("Failed to delete task.", error);
    }
  },
});

const saveCurrentBoardNote = async (noteId: string) => {
  const note = store.getState().board.notes.find((item) => item.id === noteId);

  if (!note) {
    return;
  }

  try {
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
        board: state.board,
        quickCapture: state.quickCapture,
        tasks: state.tasks,
      }),
    );
  });
}
