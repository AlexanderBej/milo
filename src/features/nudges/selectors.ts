import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@app/store";
import { generateNudges, generateTopNudge } from "./nudgeRules";

const selectCaptureItems = (state: RootState) => state.quickCapture.items;
const selectTaskItems = (state: RootState) => state.tasks.items;
const selectFocusState = (state: RootState) => state.focus;
const selectNudgesEnabled = (state: RootState) =>
  state.preferences.nudgesEnabled;

export const selectNudges = createSelector(
  [selectCaptureItems, selectTaskItems, selectFocusState, selectNudgesEnabled],
  (captures, tasks, focus, nudgesEnabled) =>
    nudgesEnabled
      ? generateNudges({
          captures,
          tasks,
          focus,
        })
      : [],
);

export const selectActiveNudge = (state: RootState, now?: Date) =>
  state.preferences.nudgesEnabled
    ? generateTopNudge({
        captures: state.quickCapture.items,
        tasks: state.tasks.items,
        focus: state.focus,
        now,
      })
    : null;
