import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@app/store";
import { selectNowIso } from "@features/time/selectors";
import {
  doesRoutineApplyToday,
  getRoutineCompletionForPeriod,
  getRoutinePeriodKey,
  isCurrentTimeInsideWindow,
  isRoutineCompleteForPeriod,
} from "./routineUtils";
import type { Routine } from "./types";

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

const parseTimeToMinutes = (time: string) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
};

const getMinutesUntilWindowStart = (
  timeWindow: Routine["timeWindow"],
  now: Date,
) => {
  const startMinutes = parseTimeToMinutes(timeWindow.start);

  if (startMinutes === null) {
    return null;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const diff = startMinutes - currentMinutes;

  return diff >= 0 ? diff : null;
};

export const selectIncompleteRoutineForCurrentPeriod = createSelector(
  [selectTodayRoutineProgress],
  (progress) => progress.filter((item) => !item.isComplete),
);

export const selectActiveRoutineForNow = createSelector(
  [selectIncompleteRoutineForCurrentPeriod, selectNowIso],
  (progress, nowIso) => {
    const now = new Date(nowIso);

    return (
      progress.find(({ routine }) =>
        isCurrentTimeInsideWindow(routine.timeWindow, now),
      ) ?? null
    );
  },
);

export const selectUpcomingRoutineForNow = createSelector(
  [selectIncompleteRoutineForCurrentPeriod, selectNowIso],
  (progress, nowIso) => {
    const now = new Date(nowIso);
    const upcoming = progress
      .filter(
        ({ routine }) => !isCurrentTimeInsideWindow(routine.timeWindow, now),
      )
      .map((item) => ({
        item,
        minutesUntilStart: getMinutesUntilWindowStart(
          item.routine.timeWindow,
          now,
        ),
      }))
      .filter(
        (
          item,
        ): item is {
          item: (typeof progress)[number];
          minutesUntilStart: number;
        } => item.minutesUntilStart !== null,
      )
      .sort((a, b) => a.minutesUntilStart - b.minutesUntilStart);

    return upcoming[0]?.item ?? null;
  },
);

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
