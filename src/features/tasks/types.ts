export type TaskStatus = "todo" | "done";
export type TaskPriority = "must" | "should" | "could";
export type TaskSource = "manual" | "capture" | "inbox" | "board";
export type TaskTimeSlot = "morning" | "afternoon" | "evening" | "anytime";
export type TaskPlanningBucket = "today" | "soon" | "later" | "someday";

export type Task = {
  id: string;
  content: string;
  description?: string;
  status: TaskStatus;
  completed: boolean;
  priority: TaskPriority;
  order?: number;
  createdAt: string;
  completedAt?: string;
  archivedAt?: string;
  source?: TaskSource;
  dueDate?: string;
  timeSlot?: TaskTimeSlot;
  planningBucket?: TaskPlanningBucket;
};
