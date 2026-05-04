import {
  addRoutine,
  completeRoutineForPeriod,
  deactivateRoutine,
  routinesReducer,
  toggleRoutineChecklistItemForPeriod,
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
      toggleRoutineChecklistItemForPeriod({
        routineId,
        periodKey: "2026-05-03",
        now: "2026-05-03T08:00:00.000Z",
        item: "Water",
      }),
    );

    expect(state.completions[0]).toMatchObject({
      routineId,
      periodKey: "2026-05-03",
      completedChecklistItems: ["Water"],
    });

    state = routinesReducer(
      state,
      toggleRoutineChecklistItemForPeriod({
        routineId,
        periodKey: "2026-05-04",
        now: "2026-05-04T08:00:00.000Z",
        item: "Meds",
      }),
    );

    expect(state.completions).toHaveLength(2);
    expect(
      state.completions.find(
        (completion) => completion.periodKey === "2026-05-03",
      ),
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
      completeRoutineForPeriod({
        routineId,
        periodKey: "2026-05-03",
        now: "2026-05-03T21:00:00.000Z",
      }),
    );

    expect(state.completions[0]).toMatchObject({
      routineId,
      periodKey: "2026-05-03",
      completedChecklistItems: ["Brush teeth", "Set alarm"],
    });
    expect(state.completions[0].completedAt).toBeDefined();
  });

  it("deactivates routines without removing completion history", () => {
    let state = routinesReducer(
      undefined,
      addRoutine({
        title: "Morning routine",
        checklist: ["Water"],
        schedule: "daily",
        timeWindow: { start: "08:00", end: "10:00" },
      }),
    );

    const routineId = state.routines[0].id;
    state = routinesReducer(
      state,
      completeRoutineForPeriod({
        routineId,
        periodKey: "2026-05-03",
        now: "2026-05-03T08:00:00.000Z",
      }),
    );
    state = routinesReducer(state, deactivateRoutine(routineId));

    expect(state.routines[0]).toMatchObject({ id: routineId, active: false });
    expect(state.completions).toHaveLength(1);
  });
});
