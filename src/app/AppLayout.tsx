import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  CalendarBlank,
  Chalkboard,
  CheckCircle,
  CheckSquare,
  ForkKnife,
  House,
  PlusCircle,
  Sun,
  UserCircle,
  Wallet,
} from "phosphor-react";

import { QuickCaptureModal } from "@features/quickCapture/components";
import { Button } from "@shared/components/Button";
import styles from "./AppLayout.module.scss";

const navItems = [
  { label: "Home", icon: House, path: "/" },
  { label: "Plan", icon: CalendarBlank, path: "/plan" },
  { label: "Today", icon: Sun },
  { label: "Tasks", icon: CheckSquare },
  { label: "Food", icon: ForkKnife },
  { label: "Money", icon: Wallet },
  { label: "Board", icon: Chalkboard, path: "/board" },
];

export const AppLayout = () => {
  const location = useLocation();
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
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
              <p className={styles.profileName}>James</p>
              <p className={styles.profileMeta}>Ready for focus</p>
            </div>
          </div>
        </div>
      </aside>

      <Outlet />

      <button
        aria-label="Open quick capture"
        className={styles.floatingCaptureButton}
        onClick={openCapture}
        type="button"
      >
        <PlusCircle aria-hidden size={30} weight="fill" />
      </button>
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
