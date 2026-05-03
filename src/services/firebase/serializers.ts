import { Timestamp } from "firebase/firestore";

const dateFields = [
  "archivedAt",
  "completedAt",
  "createdAt",
  "deletedAt",
  "processedAt",
  "updatedAt",
] as const;

type FirestoreDateLike = {
  toDate: () => unknown;
};

const hasToDate = (value: unknown): value is FirestoreDateLike => {
  return (
    value !== null &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  );
};

const toIsoString = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (hasToDate(value)) {
    const date = value.toDate();

    if (date instanceof Date) {
      return date.toISOString();
    }
  }

  return undefined;
};

export const normalizeDateFields = <T extends Record<string, unknown>>(
  data: T,
) => {
  const normalized: Record<string, unknown> = { ...data };

  for (const field of dateFields) {
    const value = normalized[field];
    const dateString = toIsoString(value);

    if (dateString) {
      normalized[field] = dateString;
    }
  }

  return normalized as T;
};

export const removeUndefinedFields = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value
      .filter((entry) => entry !== undefined)
      .map(removeUndefinedFields) as T;
  }

  if (!value || typeof value !== "object" || value instanceof Date) {
    return value;
  }

  const entries = Object.entries(value).flatMap(([key, entryValue]) =>
    entryValue === undefined
      ? []
      : [[key, removeUndefinedFields(entryValue)] as const],
  );

  return Object.fromEntries(entries) as T;
};
