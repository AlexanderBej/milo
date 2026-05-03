import {
  combineReducers,
  configureStore,
  createAction,
  createListenerMiddleware,
  type UnknownAction,
} from "@reduxjs/toolkit";

import {
  addNote,
  boardReducer,
  deleteNote,
  moveNote,
  restoreNote,
  updateNote,
} from "@features/board";
import { focusReducer } from "@features/focus";
import {
  preferencesReducer,
  resetPreferences,
  updatePreferences,
} from "@features/preferences";
import {
  addCapture,
  archiveCapture,
  processCapture,
  quickCaptureReducer,
  removeCapture,
  restoreCapture,
  softDeleteCapture,
} from "@features/quickCapture";
import {
  addRoutine,
  completeRoutineForPeriod,
  deactivateRoutine,
  deleteRoutine,
  routinesReducer,
  toggleRoutineChecklistItemForPeriod,
  updateRoutine,
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
} from "@features/tasks";
import { baseApi } from "@services/api/baseApi";
import { authReducer, setUser as setAuthUser } from "@features/auth";
import { timeReducer } from "@features/time/timeSlice";

export const resetUserOwnedData = createAction("app/resetUserOwnedData");

const appReducer = combineReducers({
  board: boardReducer,
  focus: focusReducer,
  preferences: preferencesReducer,
  quickCapture: quickCaptureReducer,
  routines: routinesReducer,
  tasks: tasksReducer,
  time: timeReducer,
  auth: authReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

const reducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: UnknownAction,
) => {
  if (resetUserOwnedData.match(action)) {
    const resetState = appReducer(undefined, action);

    return state
      ? {
          ...resetState,
          auth: state.auth,
        }
      : resetState;
  }

  return appReducer(state, action);
};

const persistenceMiddleware = createListenerMiddleware();

export const store = configureStore({
  reducer,
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

const getAuthenticatedUserId = () => store.getState().auth.user?.uid ?? null;

startAppListening({
  actionCreator: setAuthUser,
  effect: (action, listenerApi) => {
    const previousUserId = listenerApi.getOriginalState().auth.user?.uid;
    const nextUserId = action.payload?.uid;

    if (!nextUserId || previousUserId !== nextUserId) {
      listenerApi.dispatch(resetUserOwnedData());
    }
  },
});

const saveCurrentPreferences = async () => {
  const userId = getAuthenticatedUserId();

  if (!userId) {
    return;
  }

  try {
    const { savePreferences } =
      await import("@services/firebase/preferenceService");
    await savePreferences(userId, store.getState().preferences);
  } catch (error) {
    console.error("Failed to save preferences.", error);
  }
};

startAppListening({
  actionCreator: updatePreferences,
  effect: async () => {
    await saveCurrentPreferences();
  },
});

startAppListening({
  actionCreator: resetPreferences,
  effect: async () => {
    await saveCurrentPreferences();
  },
});

startAppListening({
  actionCreator: addCapture,
  effect: async (action) => {
    const userId = getAuthenticatedUserId();

    if (!userId) {
      return;
    }

    try {
      const { saveCapture } = await import("@services/firebase/captureService");
      await saveCapture(userId, action.payload);
    } catch (error) {
      console.error("Failed to save capture.", error);
    }
  },
});

startAppListening({
  actionCreator: restoreCapture,
  effect: async (action) => {
    await saveCurrentCapture(action.payload.item.id);
  },
});

const saveCurrentCapture = async (captureId: string) => {
  const userId = getAuthenticatedUserId();

  if (!userId) {
    return;
  }

  const capture = store
    .getState()
    .quickCapture.items.find((item) => item.id === captureId);

  if (!capture) {
    return;
  }

  try {
    const { saveCapture } = await import("@services/firebase/captureService");
    await saveCapture(userId, capture);
  } catch (error) {
    console.error("Failed to save capture.", error);
  }
};

startAppListening({
  actionCreator: processCapture,
  effect: async (action) => {
    await saveCurrentCapture(action.payload);
  },
});

startAppListening({
  actionCreator: archiveCapture,
  effect: async (action) => {
    await saveCurrentCapture(action.payload);
  },
});

startAppListening({
  actionCreator: softDeleteCapture,
  effect: async (action) => {
    await saveCurrentCapture(action.payload);
  },
});

startAppListening({
  actionCreator: removeCapture,
  effect: async (action) => {
    const userId = getAuthenticatedUserId();

    if (!userId) {
      return;
    }

    try {
      const { deleteCapture } =
        await import("@services/firebase/captureService");
      await deleteCapture(userId, action.payload);
    } catch (error) {
      console.error("Failed to delete capture.", error);
    }
  },
});

const saveCurrentTask = async (taskId: string) => {
  const userId = getAuthenticatedUserId();

  if (!userId) {
    return;
  }

  const task = store.getState().tasks.items.find((item) => item.id === taskId);

  if (!task) {
    return;
  }

  try {
    const { saveTask } = await import("@services/firebase/taskService");
    await saveTask(userId, task);
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
    const userId = getAuthenticatedUserId();

    if (!userId) {
      return;
    }

    const tasks = store.getState().tasks.items;

    try {
      const { saveTask } = await import("@services/firebase/taskService");
      await Promise.all(tasks.map((task) => saveTask(userId, task)));
    } catch (error) {
      console.error("Failed to save task order.", error);
    }
  },
});

startAppListening({
  actionCreator: deleteTask,
  effect: async (action) => {
    const userId = getAuthenticatedUserId();

    if (!userId) {
      return;
    }

    try {
      const { deleteTask: deleteFirebaseTask } =
        await import("@services/firebase/taskService");
      await deleteFirebaseTask(userId, action.payload);
    } catch (error) {
      console.error("Failed to delete task.", error);
    }
  },
});

const saveCurrentRoutine = async (routineId: string) => {
  const userId = getAuthenticatedUserId();

  if (!userId) {
    return;
  }

  const routine = store
    .getState()
    .routines.routines.find((item) => item.id === routineId);

  if (!routine) {
    return;
  }

  try {
    const { saveRoutine } = await import("@services/firebase/routineService");
    await saveRoutine(userId, routine);
  } catch (error) {
    console.error("Failed to save routine.", error);
  }
};

const saveCurrentRoutineCompletion = async (
  routineId: string,
  periodKey?: string,
) => {
  const userId = getAuthenticatedUserId();

  if (!userId) {
    return;
  }

  const completion = store
    .getState()
    .routines.completions.find(
      (item) =>
        item.routineId === routineId &&
        (!periodKey || item.periodKey === periodKey),
    );

  if (!completion) {
    return;
  }

  try {
    const { saveRoutineCompletion } =
      await import("@services/firebase/routineService");
    await saveRoutineCompletion(userId, completion);
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
    const userId = getAuthenticatedUserId();

    if (!userId) {
      return;
    }

    const originalState = listenerApi.getOriginalState();
    const originalCompletions = originalState.routines.completions.filter(
      (completion) => completion.routineId === action.payload,
    );

    try {
      const { deleteRoutine: deleteFirebaseRoutine, deleteRoutineCompletion } =
        await import("@services/firebase/routineService");
      await deleteFirebaseRoutine(userId, action.payload);
      await Promise.all(
        originalCompletions.map((completion) =>
          deleteRoutineCompletion(userId, completion.id),
        ),
      );
    } catch (error) {
      console.error("Failed to delete routine.", error);
    }
  },
});

startAppListening({
  actionCreator: toggleRoutineChecklistItemForPeriod,
  effect: async (action) => {
    await saveCurrentRoutineCompletion(
      action.payload.routineId,
      action.payload.periodKey ?? action.payload.date,
    );
  },
});

startAppListening({
  actionCreator: completeRoutineForPeriod,
  effect: async (action) => {
    await saveCurrentRoutineCompletion(
      action.payload.routineId,
      action.payload.periodKey ?? action.payload.date,
    );
  },
});

const saveCurrentBoardNote = async (noteId: string) => {
  const userId = getAuthenticatedUserId();

  if (!userId) {
    return;
  }

  const note = store.getState().board.notes.find((item) => item.id === noteId);

  if (!note) {
    return;
  }

  try {
    const { saveBoardNote } =
      await import("@services/firebase/boardNoteService");
    await saveBoardNote(userId, note);
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
    const userId = getAuthenticatedUserId();

    if (!userId) {
      return;
    }

    try {
      const { deleteBoardNote } =
        await import("@services/firebase/boardNoteService");
      await deleteBoardNote(userId, action.payload);
    } catch (error) {
      console.error("Failed to delete board note.", error);
    }
  },
});
