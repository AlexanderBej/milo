import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  CalendarBlank,
  Chalkboard,
  CheckCircle,
  GearSix,
  House,
  ListChecks,
  PlusCircle,
  Tray,
  UserCircle,
} from "phosphor-react";

import { useFirebaseHydration } from "@features/persistence/useFirebaseHydration";
import { QuickCaptureModal } from "@features/quickCapture/components";
import { selectDisplayName } from "@features/preferences";
import { Button } from "@shared/components/Button";
import { useAppSelector } from "./hooks";
import styles from "./AppLayout.module.scss";

const navItems = [
  { label: "Home", icon: House, path: "/" },
  { label: "Agenda", icon: CalendarBlank, path: "/plan" },
  { label: "Inbox", icon: Tray, path: "/inbox" },
  { label: "Board", icon: Chalkboard, path: "/board" },
  { label: "Routines", icon: ListChecks, path: "/routines" },
  { label: "Settings", icon: GearSix, path: "/settings" },
];

export const AppLayout = () => {
  const location = useLocation();
  const displayName = useAppSelector(selectDisplayName);
  const { error: syncError, isLoading: isSyncLoading } = useFirebaseHydration();
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [showSyncCheck, setShowSyncCheck] = useState(true);
  const [showCapturedToast, setShowCapturedToast] = useState(false);

  const openCapture = useCallback(() => {
    setIsCaptureOpen(true);
  }, []);

  const closeCapture = useCallback(() => {
    setIsCaptureOpen(false);
  }, []);

  const showCapturedFeedback = useCallback(() => {
    setShowCapturedToast(true);
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
    const timer = window.setTimeout(() => {
      setShowSyncCheck(false);
    }, 1600);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar} aria-label="Primary navigation">
        <div className={styles.brand}>
          <div className={styles.brandMark}>M</div>
          <div>
            <p className={styles.brandTitle}>MILO</p>
            <p className={styles.brandSubtitle}>Command center</p>
          </div>
        </div>

        <nav className={styles.navList}>
          {navItems.map(({ label, icon: Icon, path }) => {
            const isActive = path === location.pathname;
            const content = (
              <>
                <Icon
                  aria-hidden
                  size={20}
                  weight={isActive ? "fill" : "regular"}
                />
                <span>{label}</span>
              </>
            );

            return path ? (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={isActive ? styles.navItemActive : styles.navItem}
                key={label}
                to={path}
              >
                {content}
              </Link>
            ) : (
              <button className={styles.navItem} key={label} type="button">
                {content}
              </button>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <Button
            className={styles.captureButton}
            icon={<PlusCircle weight="fill" />}
            onClick={openCapture}
            size="md"
          >
            Quick Capture
          </Button>
          <div className={styles.profile}>
            <UserCircle aria-hidden size={32} weight="duotone" />
            <div>
              <p className={styles.profileName}>
                {displayName.trim() || "MILO friend"}
              </p>
              <p className={styles.profileMeta}>Ready for focus</p>
            </div>
          </div>
        </div>
      </aside>

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

      <QuickCaptureModal
        isOpen={isCaptureOpen}
        onCaptured={showCapturedFeedback}
        onClose={closeCapture}
      />
      {showCapturedToast ? (
        <div className={styles.toast} role="status">
          <CheckCircle aria-hidden size={20} weight="fill" />
          <span>Captured. It’s in your inbox.</span>
        </div>
      ) : null}
    </div>
  );
};
