export type RoutineSchedule = "daily" | "weekdays" | "weekends";

export type Routine = {
  id: string;
  title: string;
  description?: string;
  checklist: string[];
  schedule: RoutineSchedule;
  timeWindow: {
    start: string;
    end: string;
  };
  active: boolean;
  createdAt: string;
};

export type RoutineCompletion = {
  routineId: string;
  date: string;
  completedChecklistItems: string[];
  completedAt?: string;
};
