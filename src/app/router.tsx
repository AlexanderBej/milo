import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { BoardPage } from "../pages/Board/BoardPage";
import { DailyPlanPage } from "../pages/DailyPlan/DailyPlanPage";
import { HomePage } from "../pages/Home/HomePage";
import { InboxPage } from "../pages/Inbox/InboxPage";
import { RoutinesPage } from "../pages/Routines/RoutinesPage";
import { SettingsPage } from "../pages/Settings/SettingsPage";

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/plan" element={<DailyPlanPage />} />
        <Route path="/routines" element={<RoutinesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};
