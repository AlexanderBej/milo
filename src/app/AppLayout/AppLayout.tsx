import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { CheckCircle } from "phosphor-react";

import { useFirebaseHydration } from "@features/persistence/useFirebaseHydration";
import { FocusMode } from "@features/focus/components";
import { AppSidebar } from "@app/AppSidebar/AppSidebar";

import styles from "./AppLayout.module.scss";

const SIDEBAR_COLLAPSED_STORAGE_KEY = "milo.sidebarCollapsed";

const getInitialSidebarCollapsed = () => {
  try {
    return (
      window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "true"
    );
  } catch {
    return false;
  }
};

export const AppLayout = () => {
  const { error: syncError, isLoading: isSyncLoading } = useFirebaseHydration();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    getInitialSidebarCollapsed,
  );
  const [showSyncCheck, setShowSyncCheck] = useState(true);
  const [showCapturedToast, setShowCapturedToast] = useState(false);
  const [showFocusCompleteToast, setShowFocusCompleteToast] = useState(false);

  const toggleSidebarCollapsed = useCallback(() => {
    setIsSidebarCollapsed((current) => !current);
  }, []);

  const showFocusCompleteFeedback = useCallback(() => {
    setShowFocusCompleteToast(true);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        SIDEBAR_COLLAPSED_STORAGE_KEY,
        String(isSidebarCollapsed),
      );
    } catch {
      // localStorage can be unavailable in private or locked-down contexts.
    }
  }, [isSidebarCollapsed]);

  useEffect(() => {
    if (!showCapturedToast) {
      return;
    }

    const toastTimer = window.setTimeout(() => {
      setShowCapturedToast(false);
    }, 1800);

    return () => {
      window.clearTimeout(toastTimer);
    };
  }, [showCapturedToast]);

  useEffect(() => {
    if (!showFocusCompleteToast) {
      return;
    }

    const toastTimer = window.setTimeout(() => {
      setShowFocusCompleteToast(false);
    }, 1800);

    return () => {
      window.clearTimeout(toastTimer);
    };
  }, [showFocusCompleteToast]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSyncCheck(false);
    }, 1600);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className={
        isSidebarCollapsed
          ? `${styles.appShell} ${styles.appShellSidebarCollapsed}`
          : styles.appShell
      }
    >
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapsed={toggleSidebarCollapsed}
        setShowCapturedToast={setShowCapturedToast}
      />

      <div className={styles.contentShell}>
        {isSyncLoading && showSyncCheck ? (
          <div className={styles.syncBanner} role="status">
            Syncing your latest MILO data...
          </div>
        ) : null}
        {syncError ? (
          <div className={styles.syncBannerWarning} role="status">
            Sync is paused. Your local changes are still saved here.
          </div>
        ) : null}
        <Outlet />
      </div>

      <FocusMode onComplete={showFocusCompleteFeedback} />
      {showCapturedToast ? (
        <div className={styles.toast} role="status">
          <CheckCircle aria-hidden size={20} weight="fill" />
          <span>Captured. It’s in your inbox.</span>
        </div>
      ) : null}
      {showFocusCompleteToast ? (
        <div className={styles.toast} role="status">
          <CheckCircle aria-hidden size={20} weight="fill" />
          <span>Nice. That task is done.</span>
        </div>
      ) : null}
    </div>
  );
};
