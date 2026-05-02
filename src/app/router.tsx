import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { DailyPlanPage } from "@features/tasks/pages/DailyPlanPage";
import { HomePage } from "../pages/Home/HomePage";

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/plan" element={<DailyPlanPage />} />
      </Route>
    </Routes>
  );
};
