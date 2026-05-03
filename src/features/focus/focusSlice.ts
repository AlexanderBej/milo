import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type FocusMode = "focus" | "break";

const FOCUS_DURATION_SECONDS = 25 * 60;
const BREAK_DURATION_SECONDS = 5 * 60;

export type FocusState = {
  currentTaskId: string | null;
  lastSwappedTaskId?: string | null;
  skippedTaskIds: string[];
  startedAt: string | null;
  isRunning: boolean;
  mode: FocusMode;
  durationSeconds: number;
  remainingSeconds: number;
};

const initialState: FocusState = {
  currentTaskId: null,
  lastSwappedTaskId: null,
  skippedTaskIds: [],
  startedAt: null,
  isRunning: false,
  mode: "focus",
  durationSeconds: FOCUS_DURATION_SECONDS,
  remainingSeconds: FOCUS_DURATION_SECONDS,
};

const resetTimerForMode = (state: FocusState, mode: FocusMode) => {
  const duration =
    mode === "focus" ? FOCUS_DURATION_SECONDS : BREAK_DURATION_SECONDS;

  state.mode = mode;
  state.durationSeconds = duration;
  state.remainingSeconds = duration;
};

const closeFocusSession = (state: FocusState) => {
  state.currentTaskId = null;
  state.startedAt = null;
  state.isRunning = false;
  resetTimerForMode(state, "focus");
};

const focusSlice = createSlice({
  name: "focus",
  initialState,
  reducers: {
    startFocus(state, action: PayloadAction<string>) {
      state.currentTaskId = action.payload;
      state.lastSwappedTaskId = null;
      state.startedAt = new Date().toISOString();
      state.isRunning = true;
      resetTimerForMode(state, "focus");
    },
    pauseFocus(state) {
      state.isRunning = false;
    },
    resumeFocus(state) {
      if (state.currentTaskId && state.remainingSeconds > 0) {
        state.isRunning = true;
      }
    },
    tickFocus(state) {
      if (!state.isRunning || state.remainingSeconds <= 0) {
        return;
      }

      state.remainingSeconds = Math.max(0, state.remainingSeconds - 1);

      if (state.remainingSeconds === 0) {
        state.isRunning = false;
      }
    },
    resetFocusTimer(state) {
      resetTimerForMode(state, state.mode);
      state.isRunning = Boolean(state.currentTaskId);
    },
    skipFocusTask(state, action: PayloadAction<string>) {
      if (!state.skippedTaskIds.includes(action.payload)) {
        state.skippedTaskIds.push(action.payload);
      }

      if (state.currentTaskId === action.payload) {
        closeFocusSession(state);
      }
    },
    swapFocusTask(state, action: PayloadAction<string>) {
      state.lastSwappedTaskId = action.payload;
      if (state.currentTaskId === action.payload) {
        closeFocusSession(state);
      }
    },
    clearFocus(state) {
      state.lastSwappedTaskId = null;
      closeFocusSession(state);
    },
    exitFocus(state) {
      closeFocusSession(state);
    },
    startBreak(state) {
      if (!state.currentTaskId) {
        return;
      }

      resetTimerForMode(state, "break");
      state.isRunning = true;
    },
    resetSkippedTasks(state) {
      state.lastSwappedTaskId = null;
      state.skippedTaskIds = [];
    },
  },
});

export const {
  clearFocus,
  exitFocus,
  pauseFocus,
  resetSkippedTasks,
  resetFocusTimer,
  resumeFocus,
  skipFocusTask,
  startBreak,
  startFocus,
  swapFocusTask,
  tickFocus,
} = focusSlice.actions;
export const focusReducer = focusSlice.reducer;
