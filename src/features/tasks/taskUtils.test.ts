import type { Task } from "./types";
import { isTaskOverdue } from "./taskUtils";

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: "task-1",
  content: "Check overdue logic",
  completed: false,
  createdAt: "2026-05-01T09:00:00.000Z",
  priority: "should",
  status: "todo",
  ...overrides,
});

describe("taskUtils", () => {
  it("returns true for incomplete tasks due before today", () => {
    expect(
      isTaskOverdue(createTask({ dueDate: "2026-05-03" }), "2026-05-04"),
    ).toBe(true);
  });

  it("returns false for completed tasks", () => {
    expect(
      isTaskOverdue(
        createTask({
          completed: true,
          dueDate: "2026-05-03",
          status: "done",
        }),
        "2026-05-04",
      ),
    ).toBe(false);
  });

  it("returns false for tasks due today or in the future", () => {
    expect(
      isTaskOverdue(createTask({ dueDate: "2026-05-04" }), "2026-05-04"),
    ).toBe(false);
    expect(
      isTaskOverdue(createTask({ dueDate: "2026-05-05" }), "2026-05-04"),
    ).toBe(false);
  });

  it("returns false when no due date is set", () => {
    expect(isTaskOverdue(createTask(), "2026-05-04")).toBe(false);
  });
});
