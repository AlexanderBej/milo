import { Navigate, Route, Routes } from "react-router-dom";

import { AuthLoadingScreen, ProtectedApp } from "./ProtectedApp/ProtectedApp";
import { AppLayout } from "./AppLayout/AppLayout";
import { useAppSelector } from "./hooks";

import { BoardPage } from "../pages/Board/BoardPage";
import { DailyPlanPage } from "../pages/DailyPlan/DailyPlanPage";
import { HomePage } from "../pages/Home/HomePage";
import { InboxPage } from "../pages/Inbox/InboxPage";
import { RoutinesPage } from "../pages/Routines/RoutinesPage";
import { SettingsPage } from "../pages/Settings/SettingsPage";
import { AuthPage } from "../pages/Auth/AuthPage";

const AuthRoute = () => {
  const { loading, user } = useAppSelector((state) => state.auth);

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (user) {
    return <Navigate replace to="/" />;
  }

  return <AuthPage />;
};

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthRoute />} />

      <Route element={<ProtectedApp />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/plan" element={<DailyPlanPage />} />
          <Route path="/routines" element={<RoutinesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
};
