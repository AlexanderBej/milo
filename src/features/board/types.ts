export type BoardNote = {
  id: string;
  content: string;
  x: number;
  y: number;
  createdAt?: string;
  updatedAt?: string;
};

export type BoardState = {
  notes: BoardNote[];
};
