import type { FocusState } from "@features/focus";
import type { Routine } from "@features/routines";
import type { Task } from "@features/tasks";
import type { CaptureItem } from "@shared/types";
import { generateNudges, generateTopNudge } from "./nudgeRules";

const now = new Date("2026-05-02T13:00:00");

const buildCapture = (id: string): CaptureItem => ({
  id,
  content: `Capture ${id}`,
  processed: false,
  createdAt: "2026-05-02T08:00:00.000Z",
});

const buildTask = (
  id: string,
  priority: Task["priority"] = "should",
  status: Task["status"] = "todo",
  completedAt?: string,
): Task => ({
  id,
  content: `Task ${id}`,
  priority,
  status,
  completed: status === "done",
  createdAt: "2026-05-02T08:00:00.000Z",
  completedAt,
});

const focus: FocusState = {
  currentTaskId: null,
  lastSwappedTaskId: null,
  skippedTaskIds: [],
  startedAt: null,
  isRunning: false,
  mode: "focus",
  selectedFocusMinutes: 25,
  selectedBreakMinutes: 5,
  durationSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
};

const buildRoutine = (id: string): Routine => ({
  id,
  title: "Morning routine",
  checklist: ["Water", "Meds"],
  schedule: "daily",
  timeWindow: { start: "12:00", end: "14:00" },
  active: true,
  createdAt: "2026-05-02T08:00:00.000Z",
});

describe("generateNudges", () => {
  it("returns the inbox nudge for 5 unprocessed inbox items", () => {
    const nudge = generateTopNudge({
      captures: Array.from({ length: 5 }, (_, index) =>
        buildCapture(index.toString()),
      ),
      tasks: [buildTask("task-1")],
      focus,
      now,
    });

    expect(nudge).toEqual(
      expect.objectContaining({ id: "inbox-getting-full" }),
    );
  });

  it("returns the planning nudge for more than 3 active Must Do tasks", () => {
    const nudge = generateTopNudge({
      captures: [],
      tasks: Array.from({ length: 4 }, (_, index) =>
        buildTask(index.toString(), "must"),
      ),
      focus,
      now,
    });

    expect(nudge).toEqual(expect.objectContaining({ id: "too-many-must-dos" }));
  });

  it("returns the nothing planned nudge when there are no active tasks", () => {
    const nudge = generateTopNudge({
      captures: [],
      tasks: [],
      focus,
      now,
    });

    expect(nudge).toEqual(expect.objectContaining({ id: "nothing-planned" }));
  });

  it("returns the small win nudge after midday with tasks and no completions today", () => {
    const nudge = generateTopNudge({
      captures: [],
      tasks: [buildTask("task-1")],
      focus,
      now,
    });

    expect(nudge).toEqual(
      expect.objectContaining({ id: "small-win-after-midday" }),
    );
  });

  it("returns a routine nudge when an active routine window is open", () => {
    const nudge = generateTopNudge({
      captures: [],
      tasks: [buildTask("task-1")],
      focus,
      routines: [buildRoutine("routine-1")],
      routineCompletions: [],
      now,
    });

    expect(nudge).toEqual(
      expect.objectContaining({
        id: "routine-window-open-routine-1-2026-05-02",
        primaryAction: {
          label: "Start routine",
          route: "/routines",
        },
      }),
    );
  });

  it("does not nudge for a completed routine", () => {
    const routine = buildRoutine("routine-1");
    const nudges = generateNudges({
      captures: [],
      tasks: [buildTask("task-1", "should", "todo", now.toISOString())],
      focus,
      routines: [routine],
      routineCompletions: [
        {
          id: `${routine.id}_2026-05-02`,
          routineId: routine.id,
          periodKey: "2026-05-02",
          completedChecklistItems: routine.checklist,
          completedAt: "2026-05-02T12:30:00.000Z",
          createdAt: "2026-05-02T12:30:00.000Z",
          updatedAt: "2026-05-02T12:30:00.000Z",
        },
      ],
      now,
    });

    expect(nudges.some((nudge) => nudge.type === "routine")).toBe(false);
  });

  it("returns the lighter focus nudge after multiple focus skips", () => {
    const nudge = generateTopNudge({
      captures: [],
      tasks: [buildTask("task-1")],
      focus: {
        ...focus,
        currentTaskId: null,
        skippedTaskIds: ["task-1", "task-2"],
        startedAt: null,
      },
      now,
    });

    expect(nudge).toEqual(
      expect.objectContaining({ id: "focus-skipped-multiple" }),
    );
  });

  it("keeps the highest priority nudge first when multiple rules match", () => {
    const nudges = generateNudges({
      captures: Array.from({ length: 5 }, (_, index) =>
        buildCapture(index.toString()),
      ),
      tasks: [
        buildTask("must-1", "must"),
        buildTask("must-2", "must"),
        buildTask("must-3", "must"),
        buildTask("must-4", "must"),
      ],
      focus: {
        ...focus,
        currentTaskId: null,
        skippedTaskIds: ["task-1", "task-2"],
        startedAt: null,
      },
      now,
    });

    expect(nudges.map((nudge) => nudge.id)).toEqual([
      "inbox-getting-full",
      "too-many-must-dos",
      "focus-skipped-multiple",
      "small-win-after-midday",
    ]);
  });
});
