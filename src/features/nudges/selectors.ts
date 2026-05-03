import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@app/store";
import { selectNowIso } from "@features/time/selectors";
import { selectActiveInboxCaptures } from "@features/quickCapture";
import { generateNudges, generateTopNudge } from "./nudgeRules";

const selectTaskItems = (state: RootState) => state.tasks.items;
const selectFocusState = (state: RootState) => state.focus;
const selectRoutineItems = (state: RootState) => state.routines.routines;
const selectRoutineCompletions = (state: RootState) =>
  state.routines.completions;
const selectNudgesEnabled = (state: RootState) =>
  state.preferences.nudgesEnabled;

export const selectNudges = createSelector(
  [
    selectActiveInboxCaptures,
    selectTaskItems,
    selectFocusState,
    selectRoutineItems,
    selectRoutineCompletions,
    selectNudgesEnabled,
    selectNowIso,
  ],
  (
    captures,
    tasks,
    focus,
    routines,
    routineCompletions,
    nudgesEnabled,
    nowIso,
  ) =>
    nudgesEnabled
      ? generateNudges({
          captures,
          tasks,
          focus,
          routines,
          routineCompletions,
          now: new Date(nowIso),
        })
      : [],
);

export const selectActiveNudge = (state: RootState) =>
  state.preferences.nudgesEnabled
    ? generateTopNudge({
        captures: selectActiveInboxCaptures(state),
        tasks: state.tasks.items,
        focus: state.focus,
        routines: state.routines.routines,
        routineCompletions: state.routines.completions,
        now: new Date(state.time.nowIso),
      })
    : null;
