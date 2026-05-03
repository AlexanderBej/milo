const ensureUserId = (userId: string) => {
  const trimmedUserId = userId.trim();

  if (!trimmedUserId) {
    throw new Error("A Firebase user id is required for scoped data access.");
  }

  return trimmedUserId;
};

export const getUserPath = (userId: string) => `users/${ensureUserId(userId)}`;

export const getCapturesPath = (userId: string) =>
  `${getUserPath(userId)}/captures`;

export const getTasksPath = (userId: string) => `${getUserPath(userId)}/tasks`;

export const getBoardNotesPath = (userId: string) =>
  `${getUserPath(userId)}/boardNotes`;

export const getRoutinesPath = (userId: string) =>
  `${getUserPath(userId)}/routines`;

export const getRoutineCompletionsPath = (userId: string) =>
  `${getUserPath(userId)}/routineCompletions`;

export const getPreferencesPath = (userId: string) =>
  `${getUserPath(userId)}/preferences`;

export const getMainPreferencesPath = (userId: string) =>
  `${getPreferencesPath(userId)}/main`;
