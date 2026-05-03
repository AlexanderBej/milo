import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type {
  Task,
  TaskPlanningBucket,
  TaskPriority,
  TaskSource,
  TaskTimeSlot,
} from "./types";

export type TasksState = {
  items: Task[];
  message?: string;
};

type PersistedTask = Omit<Task, "completed"> & {
  completed?: boolean;
};

const MUST_LIMIT_MESSAGE =
  "You have a lot marked as Must. Consider moving one to Should.";
const MUST_TASK_LIMIT = 3;

const initialState: TasksState = {
  items: [],
};

const sortTasksByOrder = (items: Task[]) => {
  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

const countActiveMustTasks = (items: Task[]) => {
  return items.filter(
    (task) =>
      task.status === "todo" &&
      !task.completed &&
      !task.archivedAt &&
      task.priority === "must",
  ).length;
};

const getMustTaskLimit = (limit?: number) => {
  if (typeof limit !== "number" || !Number.isFinite(limit)) {
    return MUST_TASK_LIMIT;
  }

  return Math.min(5, Math.max(1, Math.round(limit)));
};

type AddTaskPayload = Task & {
  maxMustDoLimit?: number;
};

type UpdateTaskPayload = {
  id: string;
  changes: Partial<Omit<Task, "id" | "createdAt">>;
  maxMustDoLimit?: number;
};

const normalizeTask = (task: PersistedTask, index = 0): Task => {
  const completed = task.completed ?? task.status === "done";

  return {
    ...task,
    status: completed ? "done" : "todo",
    completed,
    order: typeof task.order === "number" ? task.order : index + 1,
    timeSlot: task.timeSlot ?? "anytime",
    planningBucket: task.planningBucket ?? "today",
  };
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask: {
      reducer(state, action: PayloadAction<AddTaskPayload>) {
        const { maxMustDoLimit, ...task } = action.payload;

        if (
          task.priority === "must" &&
          countActiveMustTasks(state.items) >= getMustTaskLimit(maxMustDoLimit)
        ) {
          state.message = MUST_LIMIT_MESSAGE;
          return;
        }

        state.items.unshift(task);
        state.message = undefined;
      },
      prepare({
        content,
        description,
        maxMustDoLimit,
        priority = "should",
        source = "manual",
        dueDate,
        timeSlot = "anytime",
        planningBucket = "today",
      }: {
        content: string;
        description?: string;
        maxMustDoLimit?: number;
        priority?: TaskPriority;
        source?: TaskSource;
        dueDate?: string;
        timeSlot?: TaskTimeSlot;
        planningBucket?: TaskPlanningBucket;
      }) {
        return {
          payload: {
            id: nanoid(),
            content,
            description,
            status: "todo" as const,
            completed: false,
            priority,
            order: -Date.now(),
            createdAt: new Date().toISOString(),
            source,
            dueDate,
            timeSlot,
            planningBucket,
            maxMustDoLimit,
          },
        };
      },
    },

    setTasks(state, action: PayloadAction<PersistedTask[]>) {
      state.items = action.payload.map((task, index) =>
        normalizeTask(task, index),
      );

      sortTasksByOrder(state.items);
      state.message = undefined;
    },

    updateTask(state, action: PayloadAction<UpdateTaskPayload>) {
      const task = state.items.find((item) => item.id === action.payload.id);

      if (!task) {
        return;
      }

      const nextPriority = action.payload.changes.priority;

      const isMovingTodoIntoMust =
        task.status === "todo" &&
        !task.completed &&
        !task.archivedAt &&
        task.priority !== "must" &&
        nextPriority === "must";

      if (
        isMovingTodoIntoMust &&
        countActiveMustTasks(state.items) >=
          getMustTaskLimit(action.payload.maxMustDoLimit)
      ) {
        state.message = MUST_LIMIT_MESSAGE;
        return;
      }

      Object.assign(task, action.payload.changes);

      if (action.payload.changes.completed !== undefined) {
        task.status = action.payload.changes.completed ? "done" : "todo";
        if (action.payload.changes.completed) {
          task.completedAt = task.completedAt ?? new Date().toISOString();
        } else {
          delete task.completedAt;
        }
      } else if (action.payload.changes.status) {
        task.completed = action.payload.changes.status === "done";
      }

      state.message = undefined;
    },

    completeTask(state, action: PayloadAction<string>) {
      const task = state.items.find((item) => item.id === action.payload);

      if (!task) {
        return;
      }

      task.status = "done";
      task.completed = true;
      task.completedAt = task.completedAt ?? new Date().toISOString();
    },

    undoCompleteTask(state, action: PayloadAction<string>) {
      const task = state.items.find((item) => item.id === action.payload);

      if (!task) {
        return;
      }

      task.status = "todo";
      task.completed = false;
      delete task.completedAt;
    },

    deleteTask(state, action: PayloadAction<string>) {
      state.items = state.items.filter((task) => task.id !== action.payload);
    },

    restoreTask(state, action: PayloadAction<{ task: Task; index?: number }>) {
      const exists = state.items.some(
        (task) => task.id === action.payload.task.id,
      );

      if (exists) {
        return;
      }

      const { archivedAt: _archivedAt, ...task } = action.payload.task;
      const restoredTask: Task = normalizeTask(task);

      const insertAt = action.payload.index ?? state.items.length;
      state.items.splice(insertAt, 0, restoredTask);
      sortTasksByOrder(state.items);
    },

    updateTaskPriority(
      state,
      action: PayloadAction<{
        id: string;
        maxMustDoLimit?: number;
        priority: TaskPriority;
      }>,
    ) {
      const task = state.items.find((item) => item.id === action.payload.id);

      if (!task) {
        return;
      }

      const isMovingTodoIntoMust =
        task.status === "todo" &&
        !task.completed &&
        !task.archivedAt &&
        task.priority !== "must" &&
        action.payload.priority === "must";

      if (
        isMovingTodoIntoMust &&
        countActiveMustTasks(state.items) >=
          getMustTaskLimit(action.payload.maxMustDoLimit)
      ) {
        state.message = MUST_LIMIT_MESSAGE;
        return;
      }

      task.priority = action.payload.priority;
      state.message = undefined;
    },

    moveTask(
      state,
      action: PayloadAction<{ id: string; direction: "up" | "down" }>,
    ) {
      sortTasksByOrder(state.items);

      const task = state.items.find((item) => item.id === action.payload.id);

      if (!task) {
        return;
      }

      const sameLaneTasks = state.items.filter(
        (item) =>
          item.status === task.status && item.priority === task.priority,
      );

      const laneIndex = sameLaneTasks.findIndex((item) => item.id === task.id);
      const targetLaneIndex =
        action.payload.direction === "up" ? laneIndex - 1 : laneIndex + 1;

      if (targetLaneIndex < 0 || targetLaneIndex >= sameLaneTasks.length) {
        return;
      }

      const targetTask = sameLaneTasks[targetLaneIndex];
      const currentOrder = task.order;
      task.order = targetTask.order;
      targetTask.order = currentOrder;
      sortTasksByOrder(state.items);
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
  moveTask,
  restoreTask,
  setTasks,
  undoCompleteTask,
  updateTask,
  updateTaskPriority,
} = tasksSlice.actions;

export const tasksReducer = tasksSlice.reducer;
