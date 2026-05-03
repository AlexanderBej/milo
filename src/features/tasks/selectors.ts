import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@app/store";
import { selectNowIso } from "@features/time/selectors";
import type { Task } from "./types";

export const selectTasksState = (state: RootState) => state.tasks;

export const selectTasks = createSelector([selectTasksState], (tasks) =>
  [...tasks.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
);

export const selectTaskMessage = createSelector(
  [selectTasksState],
  (tasks) => tasks.message,
);

export const selectTodoTasks = createSelector([selectTasks], (tasks) =>
  tasks.filter((task) => task.status === "todo" && !task.completed),
);

export const selectDoneTasks = createSelector([selectTasks], (tasks) =>
  tasks.filter((task) => task.status === "done" || task.completed),
);

export const selectActiveTasks = createSelector([selectTodoTasks], (tasks) =>
  tasks.filter((task) => !task.archivedAt),
);

export const selectCompletedTasks = selectDoneTasks;

const getLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${String(year)}-${month}-${day}`;
};

const isTaskOverdue = (task: Task, today: string) =>
  Boolean(task.dueDate && task.dueDate < today);

export const selectOverdueIncompleteTasks = createSelector(
  [selectActiveTasks, selectNowIso],
  (tasks, nowIso) => {
    const today = getLocalDateKey(new Date(nowIso));

    return tasks.filter((task) => isTaskOverdue(task, today));
  },
);

export const selectActiveTodayTasks = createSelector(
  [selectActiveTasks, selectNowIso],
  (tasks, nowIso) => {
    const today = getLocalDateKey(new Date(nowIso));

    return tasks.filter(
      (task) =>
        task.dueDate === today ||
        isTaskOverdue(task, today) ||
        (!task.dueDate && (task.planningBucket ?? "today") === "today"),
    );
  },
);

export const selectTodayIncompleteTasks = selectActiveTodayTasks;

export const selectNextTodayTask = createSelector(
  [selectTodayIncompleteTasks],
  (tasks) => tasks[0] ?? null,
);

export const selectActiveSoonTasks = createSelector(
  [selectActiveTasks, selectNowIso],
  (tasks, nowIso) => {
    const today = getLocalDateKey(new Date(nowIso));

    return tasks.filter(
      (task) =>
        !isTaskOverdue(task, today) &&
        task.dueDate !== today &&
        task.planningBucket === "soon",
    );
  },
);

export const selectActiveLaterTasks = createSelector(
  [selectActiveTasks, selectNowIso],
  (tasks, nowIso) => {
    const today = getLocalDateKey(new Date(nowIso));

    return tasks.filter(
      (task) =>
        !isTaskOverdue(task, today) &&
        task.dueDate !== today &&
        task.planningBucket === "later",
    );
  },
);

export const selectActiveSomedayTasks = createSelector(
  [selectActiveTasks, selectNowIso],
  (tasks, nowIso) => {
    const today = getLocalDateKey(new Date(nowIso));

    return tasks.filter(
      (task) =>
        !isTaskOverdue(task, today) &&
        task.dueDate !== today &&
        task.planningBucket === "someday",
    );
  },
);

export const selectMustTasks = createSelector([selectActiveTasks], (tasks) =>
  tasks.filter((task) => task.priority === "must"),
);

export const selectShouldTasks = createSelector([selectActiveTasks], (tasks) =>
  tasks.filter((task) => task.priority === "should"),
);

export const selectCouldTasks = createSelector([selectActiveTasks], (tasks) =>
  tasks.filter((task) => task.priority === "could"),
);

export const selectNextTask = createSelector(
  [selectMustTasks, selectShouldTasks, selectCouldTasks],
  (mustTasks, shouldTasks, couldTasks) => {
    if (mustTasks.length > 0) {
      return mustTasks[0];
    }

    if (shouldTasks.length > 0) {
      return shouldTasks[0];
    }

    if (couldTasks.length > 0) {
      return couldTasks[0];
    }

    return null;
  },
);
