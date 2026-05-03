import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "@app/AppLayout";
import { authReducer } from "@features/auth";
import { boardReducer } from "@features/board";
import { focusReducer } from "@features/focus";
import {
  quickCaptureReducer,
  selectCaptureItems,
} from "@features/quickCapture";
import { preferencesReducer } from "@features/preferences";
import { routinesReducer } from "@features/routines";
import { addTask, tasksReducer } from "@features/tasks";
import { baseApi } from "@services/api/baseApi";
import { HomePage } from "./HomePage";

function renderHomePage(
  setupStore?: (store: ReturnType<typeof createStore>) => void,
) {
  const store = createStore();
  setupStore?.(store);

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>,
    ),
  };
}

function createStore() {
  const store = configureStore({
    reducer: {
      board: boardReducer,
      focus: focusReducer,
      preferences: preferencesReducer,
      quickCapture: quickCaptureReducer,
      routines: routinesReducer,
      tasks: tasksReducer,
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });

  return store;
}

describe("HomePage", () => {
  it("renders the calm focus empty state", () => {
    const { store } = renderHomePage();

    expect(
      screen.getByRole("heading", { name: /good morning, james/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /nothing needs your focus right now/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^agenda$/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /inbox/i })[0]).toHaveAttribute(
      "href",
      "/inbox",
    );
    expect(screen.queryByRole("button", { name: /focus mode/i })).toBeNull();
    expect(screen.queryByText(/^food$/i)).toBeNull();
    expect(screen.queryByText(/^money$/i)).toBeNull();
    expect(selectCaptureItems(store.getState())).toHaveLength(0);
  });

  it("renders and completes the recommended focus task", async () => {
    const user = userEvent.setup();
    renderHomePage((store) => {
      store.dispatch(addTask({ content: "Stretch the launch plan" }));
    });

    expect(
      screen.getByRole("heading", { name: /stretch the launch plan/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^done$/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /nothing needs your focus right now/i,
        }),
      ).toBeInTheDocument();
    });
  });

  it("captures a quick thought from the sidebar quick capture button", async () => {
    const user = userEvent.setup();

    const { store } = renderHomePage();

    await user.click(screen.getByRole("button", { name: /quick capture/i }));

    const textarea = screen.getByRole("textbox", { name: /capture thought/i });
    expect(textarea).toHaveFocus();

    await user.type(textarea, "Remember to book dentist appointment");
    await user.click(screen.getByRole("button", { name: /^save$/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/captured/i);
    expect(selectCaptureItems(store.getState())[0]).toMatchObject({
      content: "Remember to book dentist appointment",
    });
  });
});
