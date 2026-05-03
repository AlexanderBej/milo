import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@app/store";
import {
  doesRoutineApplyToday,
  getRoutineCompletionForDate,
  getTodayDateKey,
  isRoutineCompleteForDate,
} from "./routineUtils";

export const selectRoutinesState = (state: RootState) => state.routines;

export const selectRoutines = createSelector(
  [selectRoutinesState],
  (state) => state.routines,
);

export const selectRoutineCompletions = createSelector(
  [selectRoutinesState],
  (state) => state.completions,
);

export const selectActiveRoutines = createSelector(
  [selectRoutines],
  (routines) => routines.filter((routine) => routine.active),
);

export const selectTodayRoutineProgress = createSelector(
  [selectActiveRoutines, selectRoutineCompletions],
  (routines, completions) => {
    const today = getTodayDateKey();
    const now = new Date(`${today}T12:00:00`);

    return routines
      .filter((routine) => doesRoutineApplyToday(routine, now))
      .map((routine) => {
        const completion = getRoutineCompletionForDate(
          completions,
          routine.id,
          today,
        );

        return {
          routine,
          completion,
          completedCount: completion?.completedChecklistItems.length ?? 0,
          totalCount: routine.checklist.length,
          isComplete: isRoutineCompleteForDate(routine, completion),
        };
      });
  },
);

export const getTodayRoutineProgress = selectTodayRoutineProgress;
