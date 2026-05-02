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
    removeCapture(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const { addCapture, removeCapture } = quickCaptureSlice.actions;
export const quickCaptureReducer = quickCaptureSlice.reducer;
