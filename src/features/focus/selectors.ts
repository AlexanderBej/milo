import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@app/store";
import { selectTasks } from "@features/tasks";
import type { Task, TaskPriority } from "@features/tasks";

const priorityOrder: TaskPriority[] = ["must", "should", "could"];

export const selectFocusState = (state: RootState) => state.focus;

export const selectCurrentFocusTaskId = createSelector(
  [selectFocusState],
  (focus) => focus.currentTaskId,
);

export const selectSkippedFocusTaskIds = createSelector(
  [selectFocusState],
  (focus) => focus.skippedTaskIds,
);

export const selectLastSwappedFocusTaskId = createSelector(
  [selectFocusState],
  (focus) => focus.lastSwappedTaskId,
);

export const selectFocusStartedAt = createSelector(
  [selectFocusState],
  (focus) => focus.startedAt,
);

const isAvailableFocusTask = (task: Task, skippedTaskIds: string[]) => {
  return task.status === "todo" && !skippedTaskIds.includes(task.id);
};

export const selectRecommendedFocusTask = createSelector(
  [selectTasks, selectFocusState],
  (tasks, focus) => {
    const currentTask = tasks.find((task) => task.id === focus.currentTaskId);

    if (
      currentTask &&
      isAvailableFocusTask(currentTask, focus.skippedTaskIds)
    ) {
      return currentTask;
    }

    const availableTasks = tasks.filter((task) =>
      isAvailableFocusTask(task, focus.skippedTaskIds),
    );
    const preferredTasks =
      availableTasks.length > 1
        ? availableTasks.filter(
            (task) => task.id !== (focus.lastSwappedTaskId ?? null),
          )
        : availableTasks;

    for (const priority of priorityOrder) {
      const task = preferredTasks.find((item) => item.priority === priority);

      if (task) {
        return task;
      }
    }

    return null;
  },
);
