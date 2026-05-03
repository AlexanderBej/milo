import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@app/store";

export const selectQuickCaptureState = (state: RootState) => state.quickCapture;

export const selectCaptureItems = createSelector(
  [selectQuickCaptureState],
  (quickCapture) => quickCapture.items,
);

export const selectActiveInboxCaptures = createSelector(
  [selectCaptureItems],
  (items) =>
    items.filter(
      (item) => !item.processed && !item.archivedAt && !item.deletedAt,
    ),
);

export const selectCaptureCount = createSelector(
  [selectActiveInboxCaptures],
  (items) => items.length,
);

export const selectHasCaptures = createSelector(
  [selectCaptureCount],
  (count) => count > 0,
);

export const selectLatestCapture = createSelector(
  [selectActiveInboxCaptures],
  (items) => items[0] ?? null,
);

export const selectCaptureById = createSelector(
  [selectCaptureItems, (_state: RootState, captureId: string) => captureId],
  (items, captureId) => items.find((item) => item.id === captureId) ?? null,
);

export const selectRecentCaptures = createSelector(
  [selectActiveInboxCaptures],
  (items) => items.slice(0, 5),
);
