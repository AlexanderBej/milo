import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { store } from "@app/store";
import { AppLayout } from "@app/AppLayout";
import { selectCaptureItems } from "@features/quickCapture";
import { HomePage } from "./HomePage";

function renderHomePage() {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe("HomePage", () => {
  it("renders the home screen focus surface", () => {
    renderHomePage();

    expect(
      screen.getByRole("heading", { name: /good morning, james/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /start focus/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /today.s plan/i }),
    ).toBeInTheDocument();
  });

  it("captures a quick thought from the floating action button", async () => {
    const user = userEvent.setup();

    renderHomePage();

    await user.click(
      screen.getByRole("button", { name: /open quick capture/i }),
    );

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
