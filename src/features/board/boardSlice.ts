import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type { BoardNote, BoardState } from "./types";

const START_X = 260;
const START_Y = 220;

const initialState: BoardState = {
  notes: [],
};

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    addNote: {
      reducer(state, action: PayloadAction<BoardNote>) {
        state.notes.push(action.payload);
      },
      prepare(input?: { content?: string; x?: number; y?: number }) {
        return {
          payload: {
            id: nanoid(),
            content: input?.content?.trim() ?? "",
            x: input?.x ?? START_X,
            y: input?.y ?? START_Y,
            createdAt: new Date().toISOString(),
          },
        };
      },
    },
    setBoardNotes(state, action: PayloadAction<BoardNote[]>) {
      state.notes = action.payload;
    },
    updateNote(state, action: PayloadAction<{ id: string; content: string }>) {
      const note = state.notes.find((item) => item.id === action.payload.id);

      if (!note) {
        return;
      }

      note.content = action.payload.content;
      note.updatedAt = new Date().toISOString();
    },
    moveNote(
      state,
      action: PayloadAction<{ id: string; x: number; y: number }>,
    ) {
      const note = state.notes.find((item) => item.id === action.payload.id);

      if (!note) {
        return;
      }

      note.x = action.payload.x;
      note.y = action.payload.y;
      note.updatedAt = new Date().toISOString();
    },
    deleteNote(state, action: PayloadAction<string>) {
      state.notes = state.notes.filter((note) => note.id !== action.payload);
    },
    restoreNote(
      state,
      action: PayloadAction<{ note: BoardNote; index?: number }>,
    ) {
      const exists = state.notes.some(
        (note) => note.id === action.payload.note.id,
      );

      if (exists) {
        return;
      }

      const insertAt = action.payload.index ?? state.notes.length;
      state.notes.splice(insertAt, 0, action.payload.note);
    },
  },
});

export const {
  addNote,
  deleteNote,
  moveNote,
  restoreNote,
  setBoardNotes,
  updateNote,
} = boardSlice.actions;
export const boardReducer = boardSlice.reducer;
