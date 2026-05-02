export type NudgeType = "action" | "planning" | "awareness" | "recovery";

export type Nudge = {
  id: string;
  type: NudgeType;
  message: string;
  context?: string;
  priority: number;
  primaryAction: {
    label: string;
    route: string;
  };
  createdAt?: string;
};
