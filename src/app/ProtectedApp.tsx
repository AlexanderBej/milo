import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@app/hooks";
import { TimeEngine } from "@features/time/TimeEngine";
import styles from "./ProtectedApp.module.scss";

export const AuthLoadingScreen = () => (
  <div className={styles.loadingShell} role="status">
    <div className={styles.loadingCard}>
      <div className={styles.brandMark}>M</div>
      <p>Loading MILO...</p>
    </div>
  </div>
);

export const ProtectedApp = () => {
  const location = useLocation();
  const { user, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return <Navigate replace state={{ from: location }} to="/auth" />;
  }

  return (
    <>
      <TimeEngine />
      <Outlet />
    </>
  );
};
