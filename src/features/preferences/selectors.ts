import type { RootState } from "@app/store";

export const selectPreferences = (state: RootState) => state.preferences;

export const selectDisplayName = (state: RootState) =>
  state.preferences.displayName;

export const selectMustDoLimit = (state: RootState) =>
  state.preferences.mustDoLimit;

export const selectDefaultInboxPriority = (state: RootState) =>
  state.preferences.defaultInboxPriority;

export const selectNudgesEnabled = (state: RootState) =>
  state.preferences.nudgesEnabled;
