import type { Task } from "@features/tasks";

export type PlanningSection = "today" | "soon" | "later" | "someday";

export type PlanningChoice =
  | "today"
  | "tomorrow"
  | "thisWeek"
  | "thisMonth"
  | "thisQuarter"
  | "someday";

export function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export function getTomorrowDateString() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function getTaskPlanningSection(task: Task): PlanningSection {
  const today = getTodayDateString();

  if (task.dueDate === today) return "today";
  if (!task.dueDate && task.planningBucket === "someday") return "someday";
  if (task.planningBucket) return task.planningBucket;

  return "today";
}
