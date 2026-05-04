import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@app/store";
import { selectTodayKey } from "@features/time/selectors";
import { isTaskOverdue } from "./taskUtils";

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
  tasks.filter(
    (task) => !task.archivedAt && (task.status === "done" || task.completed),
  ),
);

export const selectActiveTasks = createSelector([selectTodoTasks], (tasks) =>
  tasks.filter((task) => !task.archivedAt),
);

export const selectCompletedTasks = selectDoneTasks;

export const selectOverdueIncompleteTasks = createSelector(
  [selectActiveTasks, selectTodayKey],
  (tasks, todayKey) => tasks.filter((task) => isTaskOverdue(task, todayKey)),
);

export const selectActiveTodayTasks = createSelector(
  [selectActiveTasks, selectTodayKey],
  (tasks, todayKey) =>
    tasks
      .filter(
        (task) =>
          task.dueDate === todayKey ||
          isTaskOverdue(task, todayKey) ||
          (!task.dueDate && (task.planningBucket ?? "today") === "today"),
      )
      .sort((a, b) => {
        const aOverdue = isTaskOverdue(a, todayKey);
        const bOverdue = isTaskOverdue(b, todayKey);

        if (aOverdue === bOverdue) {
          return 0;
        }

        return aOverdue ? -1 : 1;
      }),
);

export const selectTodayIncompleteTasks = selectActiveTodayTasks;

export const selectNextTodayTask = createSelector(
  [selectTodayIncompleteTasks],
  (tasks) => tasks[0] ?? null,
);

export const selectActiveSoonTasks = createSelector(
  [selectActiveTasks, selectTodayKey],
  (tasks, todayKey) =>
    tasks.filter(
      (task) =>
        !isTaskOverdue(task, todayKey) &&
        task.dueDate !== todayKey &&
        task.planningBucket === "soon",
    ),
);

export const selectActiveLaterTasks = createSelector(
  [selectActiveTasks, selectTodayKey],
  (tasks, todayKey) =>
    tasks.filter(
      (task) =>
        !isTaskOverdue(task, todayKey) &&
        task.dueDate !== todayKey &&
        task.planningBucket === "later",
    ),
);

export const selectActiveSomedayTasks = createSelector(
  [selectActiveTasks, selectTodayKey],
  (tasks, todayKey) =>
    tasks.filter(
      (task) =>
        !isTaskOverdue(task, todayKey) &&
        task.dueDate !== todayKey &&
        task.planningBucket === "someday",
    ),
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
