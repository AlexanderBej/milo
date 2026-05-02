import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type { Task, TaskPriority, TaskSource } from "./types";

export type TasksState = {
  items: Task[];
  message?: string;
};

const MUST_LIMIT_MESSAGE = "Let’s keep Must Do to 3 so today stays doable.";
const MUST_TASK_LIMIT = 3;

const initialState: TasksState = {
  items: [],
};

const countActiveMustTasks = (items: Task[]) => {
  return items.filter(
    (task) => task.status === "todo" && task.priority === "must",
  ).length;
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask: {
      reducer(state, action: PayloadAction<Task>) {
        if (
          action.payload.priority === "must" &&
          countActiveMustTasks(state.items) >= MUST_TASK_LIMIT
        ) {
          state.message = MUST_LIMIT_MESSAGE;
          return;
        }

        state.items.unshift(action.payload);
        state.message = undefined;
      },
      prepare({
        content,
        priority = "should",
        source = "manual",
      }: {
        content: string;
        priority?: TaskPriority;
        source?: TaskSource;
      }) {
        return {
          payload: {
            id: nanoid(),
            content,
            status: "todo" as const,
            priority,
            createdAt: new Date().toISOString(),
            source,
          },
        };
      },
    },
    completeTask(state, action: PayloadAction<string>) {
      const task = state.items.find((item) => item.id === action.payload);

      if (!task) {
        return;
      }

      task.status = "done";
      task.completedAt = new Date().toISOString();
    },
    undoCompleteTask(state, action: PayloadAction<string>) {
      const task = state.items.find((item) => item.id === action.payload);

      if (!task) {
        return;
      }

      task.status = "todo";
      delete task.completedAt;
    },
    deleteTask(state, action: PayloadAction<string>) {
      state.items = state.items.filter((task) => task.id !== action.payload);
    },
    updateTaskPriority(
      state,
      action: PayloadAction<{ id: string; priority: TaskPriority }>,
    ) {
      const task = state.items.find((item) => item.id === action.payload.id);

      if (!task) {
        return;
      }

      const isMovingTodoIntoMust =
        task.status === "todo" &&
        task.priority !== "must" &&
        action.payload.priority === "must";

      if (
        isMovingTodoIntoMust &&
        countActiveMustTasks(state.items) >= MUST_TASK_LIMIT
      ) {
        state.message = MUST_LIMIT_MESSAGE;
        return;
      }

      task.priority = action.payload.priority;
      state.message = undefined;
    },
    clearTaskMessage(state) {
      state.message = undefined;
    },
  },
});

export const {
  addTask,
  clearTaskMessage,
  completeTask,
  deleteTask,
  undoCompleteTask,
  updateTaskPriority,
} = tasksSlice.actions;
export const tasksReducer = tasksSlice.reducer;
