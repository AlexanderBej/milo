export const getUserPath = (userId: string) => `users/${userId}`;

export const getCapturesPath = (userId: string) =>
  `${getUserPath(userId)}/captures`;

export const getTasksPath = (userId: string) => `${getUserPath(userId)}/tasks`;

export const getBoardNotesPath = (userId: string) =>
  `${getUserPath(userId)}/boardNotes`;

export const getRoutinesPath = (userId: string) =>
  `${getUserPath(userId)}/routines`;

export const getRoutineCompletionsPath = (userId: string) =>
  `${getUserPath(userId)}/routineCompletions`;
