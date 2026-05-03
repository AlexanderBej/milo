import type { Routine, RoutineCompletion } from "./types";

export const getTodayDateKey = (now = new Date()) => {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${String(year)}-${month}-${day}`;
};

export const doesRoutineApplyToday = (routine: Routine, date = new Date()) => {
  if (routine.schedule === "daily") {
    return true;
  }

  const day = date.getDay();
  const isWeekend = day === 0 || day === 6;

  return routine.schedule === "weekends" ? isWeekend : !isWeekend;
};

const getMinutesFromTime = (time: string) => {
  const [hours = "0", minutes = "0"] = time.split(":");

  return Number(hours) * 60 + Number(minutes);
};

export const isCurrentTimeInsideWindow = (
  timeWindow: Routine["timeWindow"],
  now = new Date(),
) => {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = getMinutesFromTime(timeWindow.start);
  const endMinutes = getMinutesFromTime(timeWindow.end);

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
};

export const getRoutineCompletionForDate = (
  completions: RoutineCompletion[],
  routineId: string,
  date: string,
) =>
  completions.find(
    (completion) =>
      completion.routineId === routineId && completion.date === date,
  );

export const isRoutineCompleteForDate = (
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
