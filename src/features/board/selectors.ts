import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@app/store";

export const selectBoardState = (state: RootState) => state.board;

export const selectBoardNotes = createSelector(
  [selectBoardState],
  (board) => board.notes,
);

export const selectBoardAreas = createSelector(
  [selectBoardState],
  (board) => board.areas,
);

export const selectBoardNoteCount = createSelector(
  [selectBoardNotes],
  (notes) => notes.length,
);
