import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import {
  getRoutineCompletionForPeriod,
  getRoutinePeriodKey,
  isRoutineCompleteForPeriod,
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
  periodKey?: string;
  now?: string;
  item: string;
};

type CompleteRoutinePayload = {
  routineId: string;
  date?: string;
  periodKey?: string;
  now?: string;
};

const normalizeChecklist = (checklist: string[]) =>
  Array.from(new Set(checklist.map((item) => item.trim()).filter(Boolean)));

type PersistedRoutine = Omit<Routine, "active" | "checklist" | "schedule"> & {
  active?: boolean;
  checklist?: unknown;
  schedule?: unknown;
};

type PersistedRoutineCompletion = Omit<
  RoutineCompletion,
  "completedChecklistItems" | "createdAt" | "id" | "periodKey" | "updatedAt"
> & {
  completedChecklistItems?: string[];
  createdAt?: string;
  date?: string;
  id?: string;
  periodKey?: string;
  updatedAt?: string;
};

const normalizeSchedule = (schedule: unknown): RoutineSchedule =>
  schedule === "weekly" ? "weekly" : "daily";

const normalizeRoutine = (routine: PersistedRoutine): Routine => ({
  ...routine,
  checklist: Array.isArray(routine.checklist)
    ? normalizeChecklist(
        routine.checklist.filter(
          (item): item is string => typeof item === "string",
        ),
      )
    : [],
  schedule: normalizeSchedule(routine.schedule),
  active: routine.active ?? true,
});

const getCompletionPeriodKey = (completion: PersistedRoutineCompletion) =>
  completion.periodKey ?? completion.date ?? "";

const normalizeCompletion = (completion: PersistedRoutineCompletion) => {
  const periodKey = getCompletionPeriodKey(completion);
  const timestamp =
    completion.updatedAt ??
    completion.completedAt ??
    completion.createdAt ??
    new Date().toISOString();

  return {
    id: completion.id || `${completion.routineId}_${periodKey}`,
    routineId: completion.routineId,
    periodKey,
    completedChecklistItems: Array.isArray(completion.completedChecklistItems)
      ? completion.completedChecklistItems
      : [],
    completedAt: completion.completedAt,
    createdAt: completion.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
};

const createRoutineCompletion = (
  routineId: string,
  periodKey: string,
  nowIso: string,
): RoutineCompletion => ({
  id: `${routineId}_${periodKey}`,
  routineId,
  periodKey,
  completedChecklistItems: [],
  createdAt: nowIso,
  updatedAt: nowIso,
});

const routinesSlice = createSlice({
  name: "routines",
  initialState,
  reducers: {
    addRoutine: {
      reducer(state, action: PayloadAction<Routine>) {
        state.routines.unshift(action.payload);
      },
      prepare(payload: AddRoutinePayload) {
        const nowIso = new Date().toISOString();

        return {
          payload: {
            id: nanoid(),
            title: payload.title.trim(),
            description: payload.description?.trim() || undefined,
            checklist: normalizeChecklist(payload.checklist),
            schedule: normalizeSchedule(payload.schedule),
            timeWindow: payload.timeWindow,
            active: payload.active ?? true,
            createdAt: nowIso,
            updatedAt: nowIso,
          },
        };
      },
    },

    setRoutines(state, action: PayloadAction<PersistedRoutine[]>) {
      state.routines = action.payload.map(normalizeRoutine);
    },

    setRoutineCompletions(
      state,
      action: PayloadAction<PersistedRoutineCompletion[]>,
    ) {
      state.completions = action.payload
        .map(normalizeCompletion)
        .filter((completion) => completion.routineId && completion.periodKey);
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
        schedule: action.payload.changes.schedule
          ? normalizeSchedule(action.payload.changes.schedule)
          : routine.schedule,
        updatedAt: new Date().toISOString(),
      });
    },

    deactivateRoutine(state, action: PayloadAction<string>) {
      const routine = state.routines.find((item) => item.id === action.payload);

      if (routine) {
        routine.active = false;
        routine.updatedAt = new Date().toISOString();
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

    toggleRoutineChecklistItemForPeriod(
      state,
      action: PayloadAction<ToggleRoutineChecklistItemPayload>,
    ) {
      const now = action.payload.now
        ? new Date(action.payload.now)
        : new Date();
      const routine = state.routines.find(
        (item) => item.id === action.payload.routineId,
      );
      const periodKey = action.payload.periodKey
        ? action.payload.periodKey
        : action.payload.date
          ? action.payload.date
          : routine
            ? getRoutinePeriodKey(routine, now)
            : "";
      const nowIso = now.toISOString();

      if (!routine || !routine.checklist.includes(action.payload.item)) {
        return;
      }

      let completion = getRoutineCompletionForPeriod(
        action.payload.routineId,
        periodKey,
        state.completions,
      );

      if (!completion) {
        completion = createRoutineCompletion(
          action.payload.routineId,
          periodKey,
          nowIso,
        );
        state.completions.push(completion);
      }

      if (completion.completedChecklistItems.includes(action.payload.item)) {
        completion.completedChecklistItems =
          completion.completedChecklistItems.filter(
            (item) => item !== action.payload.item,
          );
        delete completion.completedAt;
        completion.updatedAt = nowIso;
        return;
      }

      completion.completedChecklistItems.push(action.payload.item);
      completion.updatedAt = nowIso;

      if (isRoutineCompleteForPeriod(routine, completion)) {
        completion.completedAt = nowIso;
      }
    },

    completeRoutineForPeriod(
      state,
      action: PayloadAction<CompleteRoutinePayload>,
    ) {
      const now = action.payload.now
        ? new Date(action.payload.now)
        : new Date();
      const routine = state.routines.find(
        (item) => item.id === action.payload.routineId,
      );
      const periodKey = action.payload.periodKey
        ? action.payload.periodKey
        : action.payload.date
          ? action.payload.date
          : routine
            ? getRoutinePeriodKey(routine, now)
            : "";
      const nowIso = now.toISOString();

      if (!routine) {
        return;
      }

      let completion = getRoutineCompletionForPeriod(
        action.payload.routineId,
        periodKey,
        state.completions,
      );

      if (!completion) {
        completion = createRoutineCompletion(
          action.payload.routineId,
          periodKey,
          nowIso,
        );
        state.completions.push(completion);
      }

      completion.completedChecklistItems = [...routine.checklist];
      completion.completedAt = nowIso;
      completion.updatedAt = nowIso;
    },
  },
});

export const {
  addRoutine,
  completeRoutineForPeriod,
  deactivateRoutine,
  deleteRoutine,
  setRoutineCompletions,
  setRoutines,
  toggleRoutineChecklistItemForPeriod,
  updateRoutine,
} = routinesSlice.actions;

export const completeRoutineForDate = completeRoutineForPeriod;
export const toggleRoutineChecklistItemForDate =
  toggleRoutineChecklistItemForPeriod;

export const routinesReducer = routinesSlice.reducer;
