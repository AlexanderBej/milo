import type { RootState } from "@app/store";

export const selectAuthUser = (state: RootState) => state.auth.user;

export const selectAuthDisplayName = (state: RootState) =>
  state.auth.user?.displayName ?? "";
