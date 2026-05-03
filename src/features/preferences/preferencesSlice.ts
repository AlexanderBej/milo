import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type StartScreen = "home" | "inbox" | "plan" | "focus" | "board";
export type LayoutDensity = "comfortable" | "compact";
export type PreferencePriority = "must" | "should" | "could";
export type NudgeTone = "low-pressure";

export type PreferencesState = {
  displayName: string;
  defaultStartScreen: StartScreen;
  layoutDensity: LayoutDensity;
  mustDoLimit: number;
  defaultInboxPriority: PreferencePriority;
  nudgesEnabled: boolean;
  nudgeTone: NudgeTone;
  nudgeSnoozeMinutes: number;
};

export const defaultPreferences: PreferencesState = {
  displayName: "",
  defaultStartScreen: "home",
  layoutDensity: "comfortable",
  mustDoLimit: 3,
  defaultInboxPriority: "should",
  nudgesEnabled: true,
  nudgeTone: "low-pressure",
  nudgeSnoozeMinutes: 30,
};

const clampMustDoLimit = (value: number) => {
  if (!Number.isFinite(value)) {
    return defaultPreferences.mustDoLimit;
  }

  return Math.min(5, Math.max(1, Math.round(value)));
};

const normalizePreferences = (
  preferences: Partial<PreferencesState>,
): PreferencesState => ({
  ...defaultPreferences,
  ...preferences,
  displayName: preferences.displayName?.trimStart() ?? "",
  mustDoLimit:
    typeof preferences.mustDoLimit === "number"
      ? clampMustDoLimit(preferences.mustDoLimit)
      : defaultPreferences.mustDoLimit,
});

const preferencesSlice = createSlice({
  name: "preferences",
  initialState: defaultPreferences,
  reducers: {
    setPreferences(_state, action: PayloadAction<Partial<PreferencesState>>) {
      return normalizePreferences(action.payload);
    },
    updatePreferences(state, action: PayloadAction<Partial<PreferencesState>>) {
      Object.assign(state, action.payload);
      state.displayName = state.displayName.trimStart();
      state.mustDoLimit = clampMustDoLimit(state.mustDoLimit);
    },
    resetPreferences() {
      return defaultPreferences;
    },
  },
});

export const { resetPreferences, setPreferences, updatePreferences } =
  preferencesSlice.actions;
export const preferencesReducer = preferencesSlice.reducer;
