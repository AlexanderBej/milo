import {
  defaultPreferences,
  preferencesReducer,
  setPreferences,
  updatePreferences,
} from "./preferencesSlice";

describe("preferencesReducer", () => {
  it("normalizes hydrated partial preferences", () => {
    const state = preferencesReducer(
      undefined,
      setPreferences({
        displayName: "  Alex",
        mustDoLimit: 99,
        nudgesEnabled: false,
      }),
    );

    expect(state).toMatchObject({
      ...defaultPreferences,
      displayName: "Alex",
      mustDoLimit: 5,
      nudgesEnabled: false,
    });
  });

  it("clamps updated Must Do limits", () => {
    const state = preferencesReducer(
      undefined,
      updatePreferences({ mustDoLimit: -2 }),
    );

    expect(state.mustDoLimit).toBe(1);
  });
});
