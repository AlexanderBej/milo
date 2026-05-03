import type { FocusState } from "@features/focus";
import {
  doesRoutineApplyToday,
  getRoutineCompletionForPeriod,
  getRoutinePeriodKey,
  isCurrentTimeInsideWindow,
  isRoutineCompleteForPeriod,
  type Routine,
  type RoutineCompletion,
} from "@features/routines";
import type { Task } from "@features/tasks";
import type { CaptureItem } from "@shared/types";
import type { Nudge } from "./types";

export type NudgeRuleInput = {
  captures: CaptureItem[];
  tasks: Task[];
  focus: FocusState;
  routines?: Routine[];
  routineCompletions?: RoutineCompletion[];
  now: Date;
};

const sortByPriority = (nudges: Nudge[]) => {
  return [...nudges].sort((a, b) => b.priority - a.priority);
};

const isSameLocalDate = (dateValue: string, now: Date) => {
  const date = new Date(dateValue);

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

export const generateNudges = ({
  captures,
  tasks,
  focus,
  routines = [],
  routineCompletions = [],
  now,
}: NudgeRuleInput): Nudge[] => {
  const activeTasks = tasks.filter(
    (task) => task.status === "todo" && !task.completed && !task.archivedAt,
  );
  const activeMustTasks = activeTasks.filter(
    (task) => task.priority === "must",
  );
  const completedTodayTasks = tasks.filter(
    (task) => task.completedAt && isSameLocalDate(task.completedAt, now),
  );
  const nudges: Nudge[] = [];
  const openRoutine = routines.find((routine) => {
    const periodKey = getRoutinePeriodKey(routine, now);
    const completion = getRoutineCompletionForPeriod(
      routine.id,
      periodKey,
      routineCompletions,
    );

    return (
      routine.active &&
      doesRoutineApplyToday(routine, now) &&
      isCurrentTimeInsideWindow(routine.timeWindow, now) &&
      !isRoutineCompleteForPeriod(routine, completion)
    );
  });

  if (openRoutine) {
    const periodKey = getRoutinePeriodKey(openRoutine, now);

    nudges.push({
      id: `routine-window-open-${openRoutine.id}-${periodKey}`,
      type: "routine",
      message: `${openRoutine.title} window is open.`,
      context: "A few repeatable steps can lower the lift.",
      priority: 88,
      primaryAction: {
        label: "Start routine",
        route: "/routines",
      },
    });
  }

  if (captures.length >= 5) {
    nudges.push({
      id: "inbox-getting-full",
      type: "action",
      message: "A few thoughts are waiting in Inbox.",
      context: "A quick pass can clear some mental space.",
      priority: 90,
      primaryAction: {
        label: "Open Inbox",
        route: "/inbox",
      },
    });
  }

  if (activeMustTasks.length >= 3) {
    nudges.push({
      id: "too-many-must-dos",
      type: "planning",
      message: "You have a lot marked as Must.",
      context: "Consider moving one to Should so today stays doable.",
      priority: 85,
      primaryAction: {
        label: "Open Agenda",
        route: "/plan",
      },
    });
  }

  if (activeTasks.length === 0) {
    nudges.push({
      id: "nothing-planned",
      type: "planning",
      message: "Nothing planned yet. Want to choose one thing for today?",
      context: "One clear next step is enough.",
      priority: 80,
      primaryAction: {
        label: "Open Agenda",
        route: "/plan",
      },
    });
  }

  if (
    now.getHours() >= 12 &&
    activeTasks.length > 0 &&
    completedTodayTasks.length === 0
  ) {
    nudges.push({
      id: "small-win-after-midday",
      type: "recovery",
      message: "Want a small win to get moving?",
      context: "Pick something light and let momentum do the rest.",
      priority: 70,
      primaryAction: {
        label: "Open Home",
        route: "/",
      },
    });
  }

  if (focus.skippedTaskIds.length >= 2) {
    nudges.push({
      id: "focus-skipped-multiple",
      type: "recovery",
      message: "Not feeling that one? Let’s pick something lighter.",
      context: "Swapping is allowed. The goal is to lower friction.",
      priority: 75,
      primaryAction: {
        label: "Open Home",
        route: "/",
      },
    });
  }

  return sortByPriority(nudges);
};

export const generateTopNudge = (input: NudgeRuleInput) => {
  return generateNudges(input)[0] ?? null;
};
