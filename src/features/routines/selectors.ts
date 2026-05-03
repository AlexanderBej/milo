import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@app/store";
import { selectNowIso } from "@features/time/selectors";
import {
  doesRoutineApplyToday,
  getRoutineCompletionForPeriod,
  getRoutinePeriodKey,
  isRoutineCompleteForPeriod,
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
  [selectActiveRoutines, selectRoutineCompletions, selectNowIso],
  (routines, completions, nowIso) => {
    const now = new Date(nowIso);

    return routines
      .filter((routine) => doesRoutineApplyToday(routine, now))
      .map((routine) => {
        const periodKey = getRoutinePeriodKey(routine, now);
        const completion = getRoutineCompletionForPeriod(
          routine.id,
          periodKey,
          completions,
        );

        return {
          routine,
          completion,
          periodKey,
          completedCount: completion?.completedChecklistItems.length ?? 0,
          totalCount: routine.checklist.length,
          isComplete: isRoutineCompleteForPeriod(routine, completion),
        };
      });
  },
);

export const getTodayRoutineProgress = selectTodayRoutineProgress;

export const selectCurrentPeriodRoutineCompletion = createSelector(
  [
    selectRoutineCompletions,
    selectRoutines,
    selectNowIso,
    (_state: RootState, routineId: string) => routineId,
  ],
  (completions, routines, nowIso, routineId) => {
    const routine = routines.find((item) => item.id === routineId);

    if (!routine) {
      return null;
    }

    return (
      getRoutineCompletionForPeriod(
        routineId,
        getRoutinePeriodKey(routine, new Date(nowIso)),
        completions,
      ) ?? null
    );
  },
);
