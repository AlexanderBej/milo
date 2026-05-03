import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { CheckCircle } from "phosphor-react";

import { useFirebaseHydration } from "@features/persistence/useFirebaseHydration";
import { FocusMode } from "@features/focus/components";
import { AppSidebar } from "@app/AppSidebar/AppSidebar";

import styles from "./AppLayout.module.scss";

export const AppLayout = () => {
  const { error: syncError, isLoading: isSyncLoading } = useFirebaseHydration();
  const [showSyncCheck, setShowSyncCheck] = useState(true);
  const [showCapturedToast, setShowCapturedToast] = useState(false);
  const [showFocusCompleteToast, setShowFocusCompleteToast] = useState(false);

  const showFocusCompleteFeedback = useCallback(() => {
    setShowFocusCompleteToast(true);
  }, []);

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
    <div className={styles.appShell}>
      <AppSidebar setShowCapturedToast={setShowCapturedToast} />

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
