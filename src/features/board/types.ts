export type BoardNote = {
  id: string;
  content: string;
  x: number;
  y: number;
  createdAt?: string;
};

export type BoardState = {
  notes: BoardNote[];
};
