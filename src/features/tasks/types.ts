export type TaskStatus = "todo" | "done";
export type TaskPriority = "must" | "should" | "could";
export type TaskSource = "manual" | "capture" | "inbox" | "board";

export type Task = {
  id: string;
  content: string;
  status: TaskStatus;
  priority: TaskPriority;
  order?: number;
  createdAt: string;
  completedAt?: string;
  source?: TaskSource;
};
