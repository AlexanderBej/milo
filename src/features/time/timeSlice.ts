import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getLocalDateKey, getTimeSlot, type TimeSlot } from "./timeUtils";

export type TimeState = {
  now: string;
  nowIso: string;
  todayKey: string;
  timeSlot: TimeSlot;
};

const getTimeStateFromDate = (date: Date): TimeState => {
  const now = date.toISOString();

  return {
    now,
    nowIso: now,
    todayKey: getLocalDateKey(date),
    timeSlot: getTimeSlot(date),
  };
};

const initialState: TimeState = {
  ...getTimeStateFromDate(new Date()),
};

const timeSlice = createSlice({
  name: "time",
  initialState,
  reducers: {
    setNowIso(state, action: PayloadAction<string>) {
      const nextDate = new Date(action.payload);
      const nextState = getTimeStateFromDate(nextDate);

      if (state.nowIso !== nextState.nowIso) {
        state.now = nextState.now;
        state.nowIso = nextState.nowIso;
        state.todayKey = nextState.todayKey;
        state.timeSlot = nextState.timeSlot;
      }
    },
  },
});

export const { setNowIso } = timeSlice.actions;
export const timeReducer = timeSlice.reducer;
