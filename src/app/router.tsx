import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { BoardPage } from "../pages/Board/BoardPage";
import { DailyPlanPage } from "../pages/DailyPlan/DailyPlanPage";
import { HomePage } from "../pages/Home/HomePage";
import { SettingsPage } from "../pages/Settings/SettingsPage";

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/plan" element={<DailyPlanPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};
