import { useCallback, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CalendarBlank,
  CaretLeft,
  CaretRight,
  Chalkboard,
  GearSix,
  House,
  ListChecks,
  PlusCircle,
  Tray,
  UserCircle,
} from "phosphor-react";

import { QuickCaptureModal } from "@features/quickCapture/components";
import { selectDisplayName } from "@features/preferences";
import { useAppSelector } from "../hooks";
import logo from "../../assets/logo-full.svg";
import logoIcon from "../../assets/logo-icon.svg";

import styles from "./AppSidebar.module.scss";
import { selectAuthUser } from "@features/auth";

type AppSidebarProps = {
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  setShowCapturedToast: React.Dispatch<React.SetStateAction<boolean>>;
};

const navItems = [
  { label: "Home", icon: House, path: "/" },
  { label: "Agenda", icon: CalendarBlank, path: "/plan" },
  { label: "Inbox", icon: Tray, path: "/inbox" },
  { label: "Board", icon: Chalkboard, path: "/board" },
  { label: "Routines", icon: ListChecks, path: "/routines" },
  { label: "Settings", icon: GearSix, path: "/settings" },
];

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isCollapsed,
  onToggleCollapsed,
  setShowCapturedToast,
}) => {
  const location = useLocation();
  const displayName = useAppSelector(selectDisplayName);
  const user = useAppSelector(selectAuthUser);
  const profileLabel = displayName.trim() || user?.displayName || "Profile";
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);

  const openCapture = useCallback(() => {
    setIsCaptureOpen(true);
  }, []);

  const closeCapture = useCallback(() => {
    setIsCaptureOpen(false);
  }, []);

  const showCapturedFeedback = useCallback(() => {
    setShowCapturedToast(true);
  }, [setShowCapturedToast]);

  return (
    <>
      <aside
        className={
          isCollapsed ? `${styles.sidebar} ${styles.collapsed}` : styles.sidebar
        }
        aria-label="Primary navigation"
      >
        <div className={styles.brand}>
          <Link
            aria-label="MILO home"
            className={styles.logoLink}
            title={isCollapsed ? "MILO" : undefined}
            to="/"
          >
            <img className={styles.logoFull} src={logo} alt="MILO" />
            <img className={styles.logoIcon} src={logoIcon} alt="MILO" />
          </Link>
          <p className={styles.brandSubtitle}>
            Modular Intelligence for Life Organization
          </p>
          <button
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={styles.toggleButton}
            onClick={onToggleCollapsed}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            type="button"
          >
            {isCollapsed ? (
              <CaretRight aria-hidden size={18} weight="bold" />
            ) : (
              <CaretLeft aria-hidden size={18} weight="bold" />
            )}
          </button>
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
                <span className={styles.navLabel}>{label}</span>
              </>
            );

            return path ? (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={isActive ? styles.navItemActive : styles.navItem}
                key={label}
                title={isCollapsed ? label : undefined}
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
          <button
            aria-label={isCollapsed ? "Quick Capture" : undefined}
            className={styles.captureButton}
            onClick={openCapture}
            title={isCollapsed ? "Quick Capture" : undefined}
            type="button"
          >
            <PlusCircle aria-hidden weight="fill" />
            <span className={styles.captureLabel}>Quick Capture</span>
          </button>
          <div
            className={styles.profile}
            title={isCollapsed ? profileLabel : undefined}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                width={50}
                alt="Avatar"
                className={styles.profileImage}
              />
            ) : (
              <UserCircle aria-hidden size={32} weight="duotone" />
            )}
            <div className={styles.profileDetails}>
              <p className={styles.profileName}>{profileLabel}</p>
            </div>
          </div>
        </div>
      </aside>
      <QuickCaptureModal
        isOpen={isCaptureOpen}
        onCaptured={showCapturedFeedback}
        onClose={closeCapture}
      />
    </>
  );
};
