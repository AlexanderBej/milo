import { createSelector } from "@reduxjs/toolkit";
import { useMemo } from "react";

import { useAppSelector } from "@app/hooks";
import type { RootState } from "@app/store";

export const selectNowIso = (state: RootState) => state.time.nowIso;
export const selectTodayKey = (state: RootState) => state.time.todayKey;
export const selectTimeSlot = (state: RootState) => state.time.timeSlot;

export const selectNow = createSelector(
  [selectNowIso],
  (nowIso) => new Date(nowIso),
);

export const useNow = () => {
  const nowIso = useAppSelector(selectNowIso);

  return useMemo(() => new Date(nowIso), [nowIso]);
};
