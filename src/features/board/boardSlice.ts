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
    },
    deleteNote(state, action: PayloadAction<string>) {
      state.notes = state.notes.filter((note) => note.id !== action.payload);
    },
  },
});

export const { addNote, deleteNote, moveNote, setBoardNotes, updateNote } =
  boardSlice.actions;
export const boardReducer = boardSlice.reducer;
