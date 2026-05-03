export type RoutineSchedule = "daily" | "weekly";

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
  id: string;
  routineId: string;
  periodKey: string;
  completedChecklistItems: string[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};
