export const BOARD_AREA_COLORS = [
  "sky",
  "violet",
  "amber",
  "emerald",
  "rose",
  "indigo",
] as const;

export type BoardAreaColor = (typeof BOARD_AREA_COLORS)[number];

export const DEFAULT_BOARD_AREA_COLOR: BoardAreaColor = "sky";

export const getRandomBoardAreaColor = (): BoardAreaColor => {
  const index = Math.floor(Math.random() * BOARD_AREA_COLORS.length);

  return BOARD_AREA_COLORS[index] ?? DEFAULT_BOARD_AREA_COLOR;
};

export const isBoardAreaColor = (color: string): color is BoardAreaColor => {
  return BOARD_AREA_COLORS.includes(color as BoardAreaColor);
};
