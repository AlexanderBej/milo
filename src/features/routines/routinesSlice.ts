import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import {
  getRoutineCompletionForDate,
  getTodayDateKey,
  isRoutineCompleteForDate,
} from "./routineUtils";
import type { Routine, RoutineCompletion, RoutineSchedule } from "./types";

export type RoutinesState = {
  routines: Routine[];
  completions: RoutineCompletion[];
};

const initialState: RoutinesState = {
  routines: [],
  completions: [],
};

type AddRoutinePayload = {
  title: string;
  description?: string;
  checklist: string[];
  schedule: RoutineSchedule;
  timeWindow: Routine["timeWindow"];
  active?: boolean;
};

type UpdateRoutinePayload = {
  id: string;
  changes: Partial<Omit<Routine, "id" | "createdAt">>;
};

type ToggleRoutineChecklistItemPayload = {
  routineId: string;
  date?: string;
  item: string;
};

type CompleteRoutinePayload = {
  routineId: string;
  date?: string;
};

const normalizeChecklist = (checklist: string[]) =>
  Array.from(new Set(checklist.map((item) => item.trim()).filter(Boolean)));

const routinesSlice = createSlice({
  name: "routines",
  initialState,
  reducers: {
    addRoutine: {
      reducer(state, action: PayloadAction<Routine>) {
        state.routines.unshift(action.payload);
      },
      prepare(payload: AddRoutinePayload) {
        return {
          payload: {
            id: nanoid(),
            title: payload.title.trim(),
            description: payload.description?.trim() || undefined,
            checklist: normalizeChecklist(payload.checklist),
            schedule: payload.schedule,
            timeWindow: payload.timeWindow,
            active: payload.active ?? true,
            createdAt: new Date().toISOString(),
          },
        };
      },
    },

    setRoutines(state, action: PayloadAction<Routine[]>) {
      state.routines = action.payload;
    },

    setRoutineCompletions(state, action: PayloadAction<RoutineCompletion[]>) {
      state.completions = action.payload;
    },

    updateRoutine(state, action: PayloadAction<UpdateRoutinePayload>) {
      const routine = state.routines.find(
        (item) => item.id === action.payload.id,
      );

      if (!routine) {
        return;
      }

      Object.assign(routine, {
        ...action.payload.changes,
        title: action.payload.changes.title?.trim() ?? routine.title,
        description:
          action.payload.changes.description !== undefined
            ? action.payload.changes.description.trim() || undefined
            : routine.description,
        checklist: action.payload.changes.checklist
          ? normalizeChecklist(action.payload.changes.checklist)
          : routine.checklist,
      });
    },

    deactivateRoutine(state, action: PayloadAction<string>) {
      const routine = state.routines.find((item) => item.id === action.payload);

      if (routine) {
        routine.active = false;
      }
    },

    deleteRoutine(state, action: PayloadAction<string>) {
      state.routines = state.routines.filter(
        (routine) => routine.id !== action.payload,
      );
      state.completions = state.completions.filter(
        (completion) => completion.routineId !== action.payload,
      );
    },

    toggleRoutineChecklistItemForDate(
      state,
      action: PayloadAction<ToggleRoutineChecklistItemPayload>,
    ) {
      const date = action.payload.date ?? getTodayDateKey();
      const routine = state.routines.find(
        (item) => item.id === action.payload.routineId,
      );

      if (!routine || !routine.checklist.includes(action.payload.item)) {
        return;
      }

      let completion = getRoutineCompletionForDate(
        state.completions,
        action.payload.routineId,
        date,
      );

      if (!completion) {
        completion = {
          routineId: action.payload.routineId,
          date,
          completedChecklistItems: [],
        };
        state.completions.push(completion);
      }

      if (completion.completedChecklistItems.includes(action.payload.item)) {
        completion.completedChecklistItems =
          completion.completedChecklistItems.filter(
            (item) => item !== action.payload.item,
          );
        delete completion.completedAt;
        return;
      }

      completion.completedChecklistItems.push(action.payload.item);

      if (isRoutineCompleteForDate(routine, completion)) {
        completion.completedAt = new Date().toISOString();
      }
    },

    completeRoutineForDate(
      state,
      action: PayloadAction<CompleteRoutinePayload>,
    ) {
      const date = action.payload.date ?? getTodayDateKey();
      const routine = state.routines.find(
        (item) => item.id === action.payload.routineId,
      );

      if (!routine) {
        return;
      }

      let completion = getRoutineCompletionForDate(
        state.completions,
        action.payload.routineId,
        date,
      );

      if (!completion) {
        completion = {
          routineId: action.payload.routineId,
          date,
          completedChecklistItems: [],
        };
        state.completions.push(completion);
      }

      completion.completedChecklistItems = [...routine.checklist];
      completion.completedAt = new Date().toISOString();
    },
  },
});

export const {
  addRoutine,
  completeRoutineForDate,
  deactivateRoutine,
  deleteRoutine,
  setRoutineCompletions,
  setRoutines,
  toggleRoutineChecklistItemForDate,
  updateRoutine,
} = routinesSlice.actions;

export const routinesReducer = routinesSlice.reducer;
