import type { Task } from "./types";

const MS_IN_DAY = 24 * 60 * 60 * 1000;

const parseDateOnly = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
};

export const isTaskOverdue = (task: Task, todayKey: string) => {
  return Boolean(
    task.dueDate &&
    task.dueDate < todayKey &&
    task.status !== "done" &&
    !task.completed,
  );
};

export const getOverdueDueLabel = (dueDate: string, todayKey: string) => {
  const due = parseDateOnly(dueDate);
  const today = parseDateOnly(todayKey);

  if (!due || !today) {
    return "Due earlier";
  }

  const days = Math.max(
    1,
    Math.round((today.getTime() - due.getTime()) / MS_IN_DAY),
  );

  if (days === 1) {
    return "Due yesterday";
  }

  return `Due ${days.toString()} days ago`;
};
