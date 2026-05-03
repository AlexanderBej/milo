import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@app/store";
import { generateNudges, generateTopNudge } from "./nudgeRules";

const selectCaptureItems = (state: RootState) => state.quickCapture.items;
const selectTaskItems = (state: RootState) => state.tasks.items;
const selectFocusState = (state: RootState) => state.focus;
const selectRoutineItems = (state: RootState) => state.routines.routines;
const selectRoutineCompletions = (state: RootState) =>
  state.routines.completions;
const selectNudgesEnabled = (state: RootState) =>
  state.preferences.nudgesEnabled;
const selectNow = (_state: RootState, now?: Date) => now?.getTime() ?? 0;

export const selectNudges = createSelector(
  [
    selectCaptureItems,
    selectTaskItems,
    selectFocusState,
    selectRoutineItems,
    selectRoutineCompletions,
    selectNudgesEnabled,
    selectNow,
  ],
  (captures, tasks, focus, routines, routineCompletions, nudgesEnabled, now) =>
    nudgesEnabled
      ? generateNudges({
          captures,
          tasks,
          focus,
          routines,
          routineCompletions,
          now: now ? new Date(now) : undefined,
        })
      : [],
);

export const selectActiveNudge = (state: RootState, now?: Date) =>
  state.preferences.nudgesEnabled
    ? generateTopNudge({
        captures: state.quickCapture.items,
        tasks: state.tasks.items,
        focus: state.focus,
        routines: state.routines.routines,
        routineCompletions: state.routines.completions,
        now,
      })
    : null;
