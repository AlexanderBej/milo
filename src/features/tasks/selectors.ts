import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@app/store";

export const selectTasksState = (state: RootState) => state.tasks;

export const selectTasks = createSelector(
  [selectTasksState],
  (tasks) => tasks.items,
);

export const selectTaskMessage = createSelector(
  [selectTasksState],
  (tasks) => tasks.message,
);

export const selectTodoTasks = createSelector([selectTasks], (tasks) =>
  tasks.filter((task) => task.status === "todo"),
);

export const selectDoneTasks = createSelector([selectTasks], (tasks) =>
  tasks.filter((task) => task.status === "done"),
);

export const selectMustTasks = createSelector([selectTodoTasks], (tasks) =>
  tasks.filter((task) => task.priority === "must"),
);

export const selectShouldTasks = createSelector([selectTodoTasks], (tasks) =>
  tasks.filter((task) => task.priority === "should"),
);

export const selectCouldTasks = createSelector([selectTodoTasks], (tasks) =>
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
