import type { RootState } from "@app/store";
import {
  focusReducer,
  pauseFocus,
  resetFocusTimer,
  resumeFocus,
  skipFocusTask,
  startBreak,
  startFocus,
  swapFocusTask,
  tickFocus,
} from ".";
import { selectRecommendedFocusTask } from "./selectors";

const buildTask = (
  id: string,
  priority: "must" | "should" | "could",
  status: "todo" | "done" = "todo",
) => ({
  id,
  content: `${priority} task`,
  priority,
  status,
  completed: status === "done",
  createdAt: "2026-05-02T08:00:00.000Z",
});

const buildState = (
  tasks: RootState["tasks"]["items"],
  focus: RootState["focus"],
) =>
  ({
    tasks: { items: tasks },
    focus,
  }) as RootState;

const buildFocusState = (
  focus: Partial<RootState["focus"]> = {},
): RootState["focus"] => ({
  currentTaskId: null,
  lastSwappedTaskId: null,
  skippedTaskIds: [],
  startedAt: null,
  isRunning: false,
  mode: "focus",
  durationSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  ...focus,
});

describe("focusReducer", () => {
  it("starts focus on a task with a timestamp", () => {
    const state = focusReducer(undefined, startFocus("task-1"));

    expect(state.currentTaskId).toBe("task-1");
    expect(state.startedAt).toEqual(expect.any(String));
    expect(state.isRunning).toBe(true);
    expect(state.remainingSeconds).toBe(25 * 60);
  });

  it("ticks, pauses, resumes, and resets the focus timer", () => {
    let state = focusReducer(undefined, startFocus("task-1"));
    state = focusReducer(state, tickFocus());

    expect(state.remainingSeconds).toBe(25 * 60 - 1);

    state = focusReducer(state, pauseFocus());
    state = focusReducer(state, tickFocus());

    expect(state.isRunning).toBe(false);
    expect(state.remainingSeconds).toBe(25 * 60 - 1);

    state = focusReducer(state, resumeFocus());
    state = focusReducer(state, resetFocusTimer());

    expect(state.isRunning).toBe(true);
    expect(state.remainingSeconds).toBe(25 * 60);
  });

  it("starts and completes a 5 minute break without going below zero", () => {
    let state = focusReducer(undefined, startFocus("task-1"));
    state = { ...state, remainingSeconds: 1 };
    state = focusReducer(state, tickFocus());
    state = focusReducer(state, tickFocus());

    expect(state.remainingSeconds).toBe(0);
    expect(state.isRunning).toBe(false);

    state = focusReducer(state, startBreak());

    expect(state.mode).toBe("break");
    expect(state.durationSeconds).toBe(5 * 60);
    expect(state.remainingSeconds).toBe(5 * 60);
    expect(state.isRunning).toBe(true);
  });

  it("skips and swaps tasks for the current session", () => {
    let state = focusReducer(undefined, startFocus("task-1"));
    state = focusReducer(state, skipFocusTask("task-1"));

    expect(state.currentTaskId).toBeNull();
    expect(state.startedAt).toBeNull();
    expect(state.skippedTaskIds).toEqual(["task-1"]);

    state = focusReducer(state, swapFocusTask("task-2"));
    state = focusReducer(state, swapFocusTask("task-2"));

    expect(state.skippedTaskIds).toEqual(["task-1"]);
    expect(state.lastSwappedTaskId).toBe("task-2");
  });
});

describe("selectRecommendedFocusTask", () => {
  it("chooses the first unfinished task by priority", () => {
    const tasks = [
      buildTask("could-1", "could"),
      buildTask("should-1", "should"),
      buildTask("must-1", "must"),
    ];

    const selected = selectRecommendedFocusTask(
      buildState(tasks, {
        ...buildFocusState(),
      }),
    );

    expect(selected?.id).toBe("must-1");
  });

  it("prefers the current unfinished task when it is still available", () => {
    const tasks = [
      buildTask("must-1", "must"),
      buildTask("should-1", "should"),
    ];

    const selected = selectRecommendedFocusTask(
      buildState(tasks, {
        ...buildFocusState({
          currentTaskId: "should-1",
          startedAt: "2026-05-02T08:00:00.000Z",
        }),
      }),
    );

    expect(selected?.id).toBe("should-1");
  });

  it("ignores completed and skipped tasks", () => {
    const tasks = [
      buildTask("must-1", "must", "done"),
      buildTask("must-2", "must"),
      buildTask("should-1", "should"),
    ];

    const selected = selectRecommendedFocusTask(
      buildState(tasks, {
        ...buildFocusState({
          currentTaskId: "must-2",
          skippedTaskIds: ["must-2"],
        }),
      }),
    );

    expect(selected?.id).toBe("should-1");
  });
});
