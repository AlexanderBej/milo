import {
  doesRoutineApplyToday,
  getRoutinePeriodKey,
  getTodayDateKey,
  getWeeklyPeriodKey,
  isCurrentTimeInsideWindow,
} from "./routineUtils";
import type { Routine } from "./types";

const buildRoutine = (schedule: Routine["schedule"]): Routine => ({
  id: schedule,
  title: schedule,
  checklist: ["One"],
  schedule,
  timeWindow: { start: "08:00", end: "10:00" },
  active: true,
  createdAt: "2026-05-03T08:00:00.000Z",
});

describe("routineUtils", () => {
  it("creates a local date key", () => {
    expect(getTodayDateKey(new Date("2026-05-03T18:30:00"))).toBe("2026-05-03");
  });

  it("matches simple routine schedules", () => {
    const sunday = new Date("2026-05-03T12:00:00");

    expect(doesRoutineApplyToday(buildRoutine("daily"), sunday)).toBe(true);
    expect(doesRoutineApplyToday(buildRoutine("weekly"), sunday)).toBe(true);
  });

  it("creates daily and weekly period keys", () => {
    const sunday = new Date("2026-05-03T12:00:00");
    const monday = new Date("2026-05-04T12:00:00");

    expect(getRoutinePeriodKey(buildRoutine("daily"), sunday)).toBe(
      "2026-05-03",
    );
    expect(getWeeklyPeriodKey(sunday)).toBe("2026-W18");
    expect(getWeeklyPeriodKey(monday)).toBe("2026-W19");
  });

  it("handles same-day and overnight time windows", () => {
    expect(
      isCurrentTimeInsideWindow(
        { start: "08:00", end: "10:00" },
        new Date("2026-05-03T09:00:00"),
      ),
    ).toBe(true);
    expect(
      isCurrentTimeInsideWindow(
        { start: "22:00", end: "02:00" },
        new Date("2026-05-03T23:00:00"),
      ),
    ).toBe(true);
  });
});
