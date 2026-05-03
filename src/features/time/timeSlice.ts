import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type TimeState = {
  nowIso: string;
};

const initialState: TimeState = {
  nowIso: new Date().toISOString(),
};

const timeSlice = createSlice({
  name: "time",
  initialState,
  reducers: {
    setNowIso(state, action: PayloadAction<string>) {
      if (state.nowIso !== action.payload) {
        state.nowIso = action.payload;
      }
    },
  },
});

export const { setNowIso } = timeSlice.actions;
export const timeReducer = timeSlice.reducer;
