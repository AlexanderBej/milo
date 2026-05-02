export const getUserPath = (userId: string) => `users/${userId}`;

export const getCapturesPath = (userId: string) =>
  `${getUserPath(userId)}/captures`;

export const getTasksPath = (userId: string) => `${getUserPath(userId)}/tasks`;

export const getBoardNotesPath = (userId: string) =>
  `${getUserPath(userId)}/boardNotes`;
