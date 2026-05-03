import { isWithinTimeWindow } from "@features/time/timeUtils";
import type { Routine, RoutineCompletion } from "./types";

export const getDailyPeriodKey = (now = new Date()) => {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${String(year)}-${month}-${day}`;
};

export const getTodayDateKey = getDailyPeriodKey;

export const getWeeklyPeriodKey = (now = new Date()) => {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));

  const weekOne = new Date(date.getFullYear(), 0, 4);
  const week =
    1 +
    Math.round(
      ((date.getTime() - weekOne.getTime()) / 86400000 -
        3 +
        ((weekOne.getDay() + 6) % 7)) /
        7,
    );

  return `${String(date.getFullYear())}-W${String(week).padStart(2, "0")}`;
};

export const getRoutinePeriodKey = (routine: Routine, now = new Date()) =>
  routine.schedule === "weekly"
    ? getWeeklyPeriodKey(now)
    : getDailyPeriodKey(now);

export const doesRoutineApplyToday = (routine: Routine, date = new Date()) => {
  void routine;
  void date;
  return true;
};

export const isCurrentTimeInsideWindow = (
  timeWindow: Routine["timeWindow"],
  now = new Date(),
) => isWithinTimeWindow(now, timeWindow.start, timeWindow.end);

export const getRoutineCompletionForPeriod = (
  routineId: string,
  periodKey: string,
  completions: RoutineCompletion[],
) =>
  completions.find(
    (completion) =>
      completion.routineId === routineId && completion.periodKey === periodKey,
  );

export const getRoutineCompletionForDate = (
  completions: RoutineCompletion[],
  routineId: string,
  date: string,
) => getRoutineCompletionForPeriod(routineId, date, completions);

export const isRoutineCompleteForPeriod = (
  routine: Routine,
  completion?: RoutineCompletion,
) => {
  if (!completion) {
    return false;
  }

  if (completion.completedAt) {
    return true;
  }

  return routine.checklist.every((item) =>
    completion.completedChecklistItems.includes(item),
  );
};

export const isRoutineCompleteForDate = isRoutineCompleteForPeriod;
