import { configureStore } from "@reduxjs/toolkit";
import { focusReducer, type FocusState } from "@features/focus";
import { quickCaptureReducer } from "@features/quickCapture";
import { tasksReducer, type Task } from "@features/tasks";
import { baseApi } from "@services/api/baseApi";
import type { CaptureItem } from "@shared/types";

const reducer = {
  focus: focusReducer,
  quickCapture: quickCaptureReducer,
  tasks: tasksReducer,
  [baseApi.reducerPath]: baseApi.reducer,
};

const STORAGE_KEY = "milo:state:v1";

type PersistedState = {
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

  return {
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

export const store = configureStore({
  reducer,
  preloadedState: buildPreloadedState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

if (typeof window !== "undefined") {
  store.subscribe(() => {
    const state = store.getState();

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        focus: state.focus,
        quickCapture: state.quickCapture,
        tasks: state.tasks,
      }),
    );
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
