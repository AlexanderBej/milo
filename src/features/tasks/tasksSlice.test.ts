import {
  addTask,
  completeTask,
  deleteTask,
  tasksReducer,
  undoCompleteTask,
  updateTaskPriority,
} from "./tasksSlice";

describe("tasksReducer", () => {
  it("adds new tasks as Should todo items by default", () => {
    const state = tasksReducer(undefined, addTask({ content: "Write plan" }));

    expect(state.items[0]).toMatchObject({
      content: "Write plan",
      priority: "should",
      status: "todo",
      source: "manual",
    });
  });

  it("limits active Must Do tasks to three", () => {
    let state = tasksReducer(
      undefined,
      addTask({ content: "One", priority: "must" }),
    );
    state = tasksReducer(state, addTask({ content: "Two", priority: "must" }));
    state = tasksReducer(
      state,
      addTask({ content: "Three", priority: "must" }),
    );
    state = tasksReducer(state, addTask({ content: "Four", priority: "must" }));

    expect(state.items).toHaveLength(3);
    expect(state.message).toBe(
      "You have a lot marked as Must. Consider moving one to Should.",
    );
  });

  it("prevents moving a fourth active task into Must Do", () => {
    let state = tasksReducer(
      undefined,
      addTask({ content: "One", priority: "must" }),
    );
    state = tasksReducer(state, addTask({ content: "Two", priority: "must" }));
    state = tasksReducer(
      state,
      addTask({ content: "Three", priority: "must" }),
    );
    state = tasksReducer(state, addTask({ content: "Four" }));

    const shouldTaskId = state.items[0].id;
    state = tasksReducer(
      state,
      updateTaskPriority({ id: shouldTaskId, priority: "must" }),
    );

    expect(state.items[0]).toMatchObject({ priority: "should" });
    expect(state.message).toBe(
      "You have a lot marked as Must. Consider moving one to Should.",
    );
  });

  it("does not count completed Must Do tasks toward the limit", () => {
    let state = tasksReducer(
      undefined,
      addTask({ content: "One", priority: "must" }),
    );
    state = tasksReducer(state, addTask({ content: "Two", priority: "must" }));
    state = tasksReducer(
      state,
      addTask({ content: "Three", priority: "must" }),
    );

    const completedTaskId = state.items[0].id;
    state = tasksReducer(state, completeTask(completedTaskId));
    state = tasksReducer(state, addTask({ content: "Four", priority: "must" }));

    expect(state.items.filter((task) => task.priority === "must")).toHaveLength(
      4,
    );
    expect(
      state.items.filter(
        (task) => task.priority === "must" && task.status === "todo",
      ),
    ).toHaveLength(3);

    state = tasksReducer(state, undoCompleteTask(completedTaskId));
    expect(
      state.items.find((task) => task.id === completedTaskId),
    ).toMatchObject({
      status: "todo",
    });
  });

  it("preserves completedAt when a completed task is completed again", () => {
    let state = tasksReducer(undefined, addTask({ content: "Already done" }));
    const taskId = state.items[0].id;

    state = tasksReducer(state, completeTask(taskId));
    const completedAt = state.items[0].completedAt;
    state = tasksReducer(state, completeTask(taskId));

    expect(state.items[0].completedAt).toBe(completedAt);
  });

  it("archives tasks instead of removing them", () => {
    let state = tasksReducer(undefined, addTask({ content: "Keep history" }));
    const taskId = state.items[0].id;

    state = tasksReducer(state, completeTask(taskId));
    const completedAt = state.items[0].completedAt;
    state = tasksReducer(state, deleteTask(taskId));

    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({
      id: taskId,
      completedAt,
      status: "done",
    });
    expect(state.items[0].archivedAt).toBeDefined();
  });
});
