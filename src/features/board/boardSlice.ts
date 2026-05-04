import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import { getRandomBoardAreaColor } from "./constants";
import type { BoardArea, BoardNote, BoardState } from "./types";

const START_X = 260;
const START_Y = 220;
const AREA_WIDTH = 520;
const AREA_HEIGHT = 320;

const initialState: BoardState = {
  areas: [],
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
    addArea: {
      reducer(state, action: PayloadAction<BoardArea>) {
        state.areas.push(action.payload);
      },
      prepare(input?: {
        title?: string;
        position?: { x: number; y: number };
        size?: { width: number; height: number };
        color?: string;
      }) {
        return {
          payload: {
            id: nanoid(),
            title: input?.title?.trim() || "New area",
            position: input?.position ?? { x: START_X - 80, y: START_Y - 80 },
            size: input?.size ?? { width: AREA_WIDTH, height: AREA_HEIGHT },
            color: input?.color ?? getRandomBoardAreaColor(),
            createdAt: Date.now(),
          },
        };
      },
    },
    setBoardNotes(state, action: PayloadAction<BoardNote[]>) {
      state.notes = action.payload;
    },
    setBoardAreas(state, action: PayloadAction<BoardArea[]>) {
      state.areas = action.payload;
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
    persistNotePosition(state, action: PayloadAction<string>) {
      void state;
      void action;
    },
    updateAreaTitle(
      state,
      action: PayloadAction<{ id: string; title: string }>,
    ) {
      const area = state.areas.find((item) => item.id === action.payload.id);

      if (!area) {
        return;
      }

      area.title = action.payload.title;
      area.updatedAt = Date.now();
    },
    moveArea(
      state,
      action: PayloadAction<{ id: string; x: number; y: number }>,
    ) {
      const area = state.areas.find((item) => item.id === action.payload.id);

      if (!area) {
        return;
      }

      area.position = { x: action.payload.x, y: action.payload.y };
      area.updatedAt = Date.now();
    },
    resizeArea(
      state,
      action: PayloadAction<{ id: string; width: number; height: number }>,
    ) {
      const area = state.areas.find((item) => item.id === action.payload.id);

      if (!area) {
        return;
      }

      area.size = {
        width: action.payload.width,
        height: action.payload.height,
      };
      area.updatedAt = Date.now();
    },
    persistAreaLayout(state, action: PayloadAction<string>) {
      void state;
      void action;
    },
    deleteArea(state, action: PayloadAction<string>) {
      state.areas = state.areas.filter((area) => area.id !== action.payload);
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
  addArea,
  addNote,
  deleteArea,
  deleteNote,
  moveArea,
  moveNote,
  persistAreaLayout,
  persistNotePosition,
  resizeArea,
  restoreNote,
  setBoardAreas,
  setBoardNotes,
  updateAreaTitle,
  updateNote,
} = boardSlice.actions;
export const boardReducer = boardSlice.reducer;
