import type { FocusState } from "@features/focus";
import type { Task } from "@features/tasks";
import type { CaptureItem } from "@shared/types";
import { generateNudges, generateTopNudge } from "./nudgeRules";

const now = new Date("2026-05-02T13:00:00");

const buildCapture = (id: string): CaptureItem => ({
  id,
  content: `Capture ${id}`,
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
  createdAt: "2026-05-02T08:00:00.000Z",
  completedAt,
});

const focus: FocusState = {
  currentTaskId: null,
  skippedTaskIds: [],
  startedAt: null,
};

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

  it("returns the lighter focus nudge after multiple focus skips", () => {
    const nudge = generateTopNudge({
      captures: [],
      tasks: [buildTask("task-1")],
      focus: {
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
