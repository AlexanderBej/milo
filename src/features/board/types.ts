export type BoardNote = {
  id: string;
  content: string;
  x: number;
  y: number;
  createdAt?: string;
  updatedAt?: string;
};

export type BoardArea = {
  id: string;
  title: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  color?: string;
  createdAt: number;
  updatedAt?: number;
};

export type BoardState = {
  areas: BoardArea[];
  notes: BoardNote[];
};
