export {
  BOARD_AREA_COLORS,
  DEFAULT_BOARD_AREA_COLOR,
  getRandomBoardAreaColor,
  isBoardAreaColor,
} from "./constants";
export {
  selectBoardAreas,
  selectBoardNoteCount,
  selectBoardNotes,
  selectBoardState,
} from "./selectors";
export {
  addArea,
  addNote,
  deleteArea,
  boardReducer,
  moveArea,
  deleteNote,
  moveNote,
  persistAreaLayout,
  persistNotePosition,
  resizeArea,
  restoreNote,
  setBoardAreas,
  setBoardNotes,
  updateAreaTitle,
  updateNote,
} from "./boardSlice";
export type { BoardArea, BoardNote, BoardState } from "./types";
