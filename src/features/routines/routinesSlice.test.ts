import {
  addRoutine,
  completeRoutineForDate,
  routinesReducer,
  toggleRoutineChecklistItemForDate,
} from "./routinesSlice";

describe("routinesReducer", () => {
  it("tracks checklist completion per date", () => {
    let state = routinesReducer(
      undefined,
      addRoutine({
        title: "Morning routine",
        checklist: ["Water", "Meds"],
        schedule: "daily",
        timeWindow: { start: "08:00", end: "10:00" },
      }),
    );

    const routineId = state.routines[0].id;

    state = routinesReducer(
      state,
      toggleRoutineChecklistItemForDate({
        routineId,
        date: "2026-05-03",
        item: "Water",
      }),
    );

    expect(state.completions).toEqual([
      {
        routineId,
        date: "2026-05-03",
        completedChecklistItems: ["Water"],
      },
    ]);

    state = routinesReducer(
      state,
      toggleRoutineChecklistItemForDate({
        routineId,
        date: "2026-05-04",
        item: "Meds",
      }),
    );

    expect(state.completions).toHaveLength(2);
    expect(
      state.completions.find((completion) => completion.date === "2026-05-03"),
    ).toMatchObject({ completedChecklistItems: ["Water"] });
  });

  it("marks every checklist item complete for a date", () => {
    let state = routinesReducer(
      undefined,
      addRoutine({
        title: "Night routine",
        checklist: ["Brush teeth", "Set alarm"],
        schedule: "daily",
        timeWindow: { start: "21:00", end: "23:00" },
      }),
    );

    const routineId = state.routines[0].id;

    state = routinesReducer(
      state,
      completeRoutineForDate({ routineId, date: "2026-05-03" }),
    );

    expect(state.completions[0]).toMatchObject({
      routineId,
      date: "2026-05-03",
      completedChecklistItems: ["Brush teeth", "Set alarm"],
    });
    expect(state.completions[0].completedAt).toBeDefined();
  });
});
