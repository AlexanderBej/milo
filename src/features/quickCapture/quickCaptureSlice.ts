import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type { CaptureItem } from "@shared/types";

type QuickCaptureState = {
  items: CaptureItem[];
};

const initialState: QuickCaptureState = {
  items: [],
};

const quickCaptureSlice = createSlice({
  name: "quickCapture",
  initialState,
  reducers: {
    addCapture: {
      reducer(state, action: PayloadAction<CaptureItem>) {
        state.items.unshift(action.payload);
      },
      prepare(content: string) {
        return {
          payload: {
            id: nanoid(),
            content,
            createdAt: new Date().toISOString(),
          },
        };
      },
    },
    setCaptures(state, action: PayloadAction<CaptureItem[]>) {
      state.items = action.payload;
    },
    removeCapture(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    restoreCapture(
      state,
      action: PayloadAction<{ item: CaptureItem; index?: number }>,
    ) {
      const exists = state.items.some(
        (item) => item.id === action.payload.item.id,
      );

      if (exists) {
        return;
      }

      const insertAt = action.payload.index ?? state.items.length;
      state.items.splice(insertAt, 0, action.payload.item);
    },
  },
});

export const { addCapture, removeCapture, restoreCapture, setCaptures } =
  quickCaptureSlice.actions;
export const quickCaptureReducer = quickCaptureSlice.reducer;
