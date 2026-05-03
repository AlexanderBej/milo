export type TimeSlot = "morning" | "afternoon" | "evening" | "night";

const MS_IN_DAY = 24 * 60 * 60 * 1000;

const asDate = (value: Date | string | number) =>
  value instanceof Date ? value : new Date(value);

export const getTimeSlot = (now: Date | string | number): TimeSlot => {
  const hour = asDate(now).getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 17) {
    return "afternoon";
  }

  if (hour >= 17 && hour < 22) {
    return "evening";
  }

  return "night";
};

export const getGreetingForTime = (now: Date | string | number) => {
  const slot = getTimeSlot(now);

  if (slot === "morning") {
    return "Good morning";
  }

  if (slot === "afternoon") {
    return "Good afternoon";
  }

  return "Good evening";
};

const getLocalDateStart = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

export const formatRelativeTime = (
  dateValue: Date | string | number,
  nowValue: Date | string | number,
) => {
  const date = asDate(dateValue);
  const now = asDate(nowValue);
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const dayDiff = Math.floor(
    (getLocalDateStart(now) - getLocalDateStart(date)) / MS_IN_DAY,
  );

  if (seconds < 60) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes.toString()} min ago`;
  }

  if (hours < 24 && dayDiff === 0) {
    return `${hours.toString()} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  if (dayDiff === 1) {
    return "yesterday";
  }

  if (dayDiff < 14) {
    return `${dayDiff.toString()} days ago`;
  }

  const weeks = Math.floor(dayDiff / 7);

  return `${weeks.toString()} ${weeks === 1 ? "week" : "weeks"} ago`;
};

const parseTimeToMinutes = (time: string) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
};

export const isWithinTimeWindow = (
  nowValue: Date | string | number,
  start: string,
  end: string,
) => {
  const now = asDate(nowValue);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = parseTimeToMinutes(start);
  const endMinutes = parseTimeToMinutes(end);

  if (startMinutes === null || endMinutes === null) {
    return false;
  }

  if (startMinutes === endMinutes) {
    return currentMinutes === startMinutes;
  }

  if (startMinutes < endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
};
