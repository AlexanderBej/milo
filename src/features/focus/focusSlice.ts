import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type FocusState = {
  currentTaskId: string | null;
  skippedTaskIds: string[];
  startedAt: string | null;
};

const initialState: FocusState = {
  currentTaskId: null,
  skippedTaskIds: [],
  startedAt: null,
};

const focusSlice = createSlice({
  name: "focus",
  initialState,
  reducers: {
    startFocus(state, action: PayloadAction<string>) {
      state.currentTaskId = action.payload;
      state.startedAt = new Date().toISOString();
    },
    skipFocusTask(state, action: PayloadAction<string>) {
      if (!state.skippedTaskIds.includes(action.payload)) {
        state.skippedTaskIds.push(action.payload);
      }

      if (state.currentTaskId === action.payload) {
        state.currentTaskId = null;
        state.startedAt = null;
      }
    },
    swapFocusTask(state, action: PayloadAction<string>) {
      if (!state.skippedTaskIds.includes(action.payload)) {
        state.skippedTaskIds.push(action.payload);
      }

      if (state.currentTaskId === action.payload) {
        state.currentTaskId = null;
        state.startedAt = null;
      }
    },
    clearFocus(state) {
      state.currentTaskId = null;
      state.startedAt = null;
    },
    resetSkippedTasks(state) {
      state.skippedTaskIds = [];
    },
  },
});

export const {
  clearFocus,
  resetSkippedTasks,
  skipFocusTask,
  startFocus,
  swapFocusTask,
} = focusSlice.actions;
export const focusReducer = focusSlice.reducer;
