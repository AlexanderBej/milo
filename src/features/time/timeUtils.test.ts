import {
  formatRelativeTime,
  getGreetingForTime,
  getTimeSlot,
  isWithinTimeWindow,
} from "./timeUtils";

describe("timeUtils", () => {
  it("returns greetings and slots for the current local hour", () => {
    expect(getTimeSlot(new Date("2026-05-03T08:00:00"))).toBe("morning");
    expect(getGreetingForTime(new Date("2026-05-03T08:00:00"))).toBe(
      "Good morning",
    );
    expect(getGreetingForTime(new Date("2026-05-03T13:00:00"))).toBe(
      "Good afternoon",
    );
    expect(getGreetingForTime(new Date("2026-05-03T21:00:00"))).toBe(
      "Good evening",
    );
    expect(getGreetingForTime(new Date("2026-05-03T02:00:00"))).toBe(
      "Good night",
    );
  });

  it("formats relative times from an explicit now", () => {
    const now = new Date("2026-05-15T12:00:00");

    expect(formatRelativeTime("2026-05-15T11:59:40", now)).toBe("just now");
    expect(formatRelativeTime("2026-05-15T11:55:00", now)).toBe("5 min ago");
    expect(formatRelativeTime("2026-05-15T10:00:00", now)).toBe("2 hours ago");
    expect(formatRelativeTime("2026-05-14T18:00:00", now)).toBe("yesterday");
    expect(formatRelativeTime("2026-05-12T12:00:00", now)).toBe("3 days ago");
    expect(formatRelativeTime("2026-05-01T12:00:00", now)).toBe("2 weeks ago");
  });

  it("checks normal and overnight HH:mm windows", () => {
    expect(
      isWithinTimeWindow(new Date("2026-05-03T10:00:00"), "09:00", "17:00"),
    ).toBe(true);
    expect(
      isWithinTimeWindow(new Date("2026-05-03T18:00:00"), "09:00", "17:00"),
    ).toBe(false);
    expect(
      isWithinTimeWindow(new Date("2026-05-03T23:00:00"), "22:00", "02:00"),
    ).toBe(true);
    expect(
      isWithinTimeWindow(new Date("2026-05-04T01:30:00"), "22:00", "02:00"),
    ).toBe(true);
    expect(
      isWithinTimeWindow(new Date("2026-05-04T03:00:00"), "22:00", "02:00"),
    ).toBe(false);
  });
});
