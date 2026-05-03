import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type { CaptureItem } from "@shared/types";

type QuickCaptureState = {
  items: CaptureItem[];
};

type PersistedCaptureItem = Omit<CaptureItem, "processed"> & {
  processed?: boolean;
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
            processed: false,
            createdAt: new Date().toISOString(),
          },
        };
      },
    },
    setCaptures(state, action: PayloadAction<PersistedCaptureItem[]>) {
      state.items = action.payload.map((item) => ({
        ...item,
        processed: item.processed ?? Boolean(item.processedAt),
      }));
    },
    processCapture(state, action: PayloadAction<string>) {
      const item = state.items.find((capture) => capture.id === action.payload);

      if (!item) {
        return;
      }

      item.processed = true;
      item.processedAt = new Date().toISOString();
      delete item.archivedAt;
      delete item.deletedAt;
    },
    softDeleteCapture(state, action: PayloadAction<string>) {
      const item = state.items.find((capture) => capture.id === action.payload);

      if (!item) {
        return;
      }

      item.deletedAt = new Date().toISOString();
    },
    archiveCapture(state, action: PayloadAction<string>) {
      const item = state.items.find((capture) => capture.id === action.payload);

      if (!item) {
        return;
      }

      item.archivedAt = new Date().toISOString();
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

      const {
        archivedAt: _archivedAt,
        deletedAt: _deletedAt,
        processedAt: _processedAt,
        ...item
      } = action.payload.item;
      const restoredItem: CaptureItem = {
        ...item,
        processed: false,
      };

      const insertAt = action.payload.index ?? state.items.length;
      state.items.splice(insertAt, 0, restoredItem);
    },
  },
});

export const {
  addCapture,
  archiveCapture,
  processCapture,
  removeCapture,
  restoreCapture,
  setCaptures,
  softDeleteCapture,
} = quickCaptureSlice.actions;
export const quickCaptureReducer = quickCaptureSlice.reducer;
