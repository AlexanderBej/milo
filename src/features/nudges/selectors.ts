import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@app/store";
import { generateNudges, generateTopNudge } from "./nudgeRules";

const selectCaptureItems = (state: RootState) => state.quickCapture.items;
const selectTaskItems = (state: RootState) => state.tasks.items;
const selectFocusState = (state: RootState) => state.focus;

export const selectNudges = createSelector(
  [selectCaptureItems, selectTaskItems, selectFocusState],
  (captures, tasks, focus) =>
    generateNudges({
      captures,
      tasks,
      focus,
    }),
);

export const selectActiveNudge = (state: RootState, now?: Date) =>
  generateTopNudge({
    captures: state.quickCapture.items,
    tasks: state.tasks.items,
    focus: state.focus,
    now,
  });
