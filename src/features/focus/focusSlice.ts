import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type FocusMode = "focus" | "break";

export const FOCUS_DURATION_OPTIONS = [15, 25, 50] as const;
export const BREAK_DURATION_OPTIONS = [2, 5, 10] as const;

const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;

const minutesToSeconds = (minutes: number) => minutes * 60;

const normalizeDuration = (
  minutes: number,
  options: readonly number[],
  fallback: number,
) => (options.includes(minutes) ? minutes : fallback);

export type FocusState = {
  currentTaskId: string | null;
  lastSwappedTaskId?: string | null;
  skippedTaskIds: string[];
  startedAt: string | null;
  isRunning: boolean;
  mode: FocusMode;
  selectedFocusMinutes: number;
  selectedBreakMinutes: number;
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
  selectedFocusMinutes: DEFAULT_FOCUS_MINUTES,
  selectedBreakMinutes: DEFAULT_BREAK_MINUTES,
  durationSeconds: minutesToSeconds(DEFAULT_FOCUS_MINUTES),
  remainingSeconds: minutesToSeconds(DEFAULT_FOCUS_MINUTES),
};

const resetTimerForMode = (state: FocusState, mode: FocusMode) => {
  const duration =
    mode === "focus"
      ? minutesToSeconds(state.selectedFocusMinutes)
      : minutesToSeconds(state.selectedBreakMinutes);

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
    setSelectedFocusMinutes(state, action: PayloadAction<number>) {
      state.selectedFocusMinutes = normalizeDuration(
        action.payload,
        FOCUS_DURATION_OPTIONS,
        DEFAULT_FOCUS_MINUTES,
      );

      if (!state.currentTaskId && state.mode === "focus") {
        resetTimerForMode(state, "focus");
      }
    },
    setSelectedBreakMinutes(state, action: PayloadAction<number>) {
      state.selectedBreakMinutes = normalizeDuration(
        action.payload,
        BREAK_DURATION_OPTIONS,
        DEFAULT_BREAK_MINUTES,
      );

      if (!state.currentTaskId && state.mode === "break") {
        resetTimerForMode(state, "break");
      }
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
    startNextFocus(state) {
      if (!state.currentTaskId) {
        return;
      }

      state.startedAt = new Date().toISOString();
      resetTimerForMode(state, "focus");
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
  setSelectedBreakMinutes,
  setSelectedFocusMinutes,
  skipFocusTask,
  startBreak,
  startFocus,
  startNextFocus,
  swapFocusTask,
  tickFocus,
} = focusSlice.actions;
export const focusReducer = focusSlice.reducer;
