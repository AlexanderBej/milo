import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthUser = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
};

const initialState: AuthState = {
  user: null,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.loading = false;
    },
    finishAuthLoading(state) {
      state.loading = false;
    },
  },
});

export const { finishAuthLoading, setUser } = authSlice.actions;
export const authReducer = authSlice.reducer;
