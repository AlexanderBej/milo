import { configureStore } from "@reduxjs/toolkit";
import { quickCaptureReducer } from "@features/quickCapture";
import { tasksReducer } from "@features/tasks";
import { baseApi } from "@services/api/baseApi";

const reducer = {
  quickCapture: quickCaptureReducer,
  tasks: tasksReducer,
  [baseApi.reducerPath]: baseApi.reducer,
};

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
