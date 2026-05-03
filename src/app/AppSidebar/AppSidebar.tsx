import { useCallback, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CalendarBlank,
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
import { Button } from "@shared/components/Button";
import { useAppSelector } from "../hooks";
import logo from "../../assets/logo-full.svg";

import styles from "./AppSidebar.module.scss";
import { selectAuthUser } from "@features/auth";

type AppSidebarProps = {
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
  setShowCapturedToast,
}) => {
  const location = useLocation();
  const displayName = useAppSelector(selectDisplayName);
  const user = useAppSelector(selectAuthUser);
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
      <aside className={styles.sidebar} aria-label="Primary navigation">
        <div className={styles.brand}>
          {/* <div className={styles.brandMark}>M</div> */}
          <img width={140} src={logo} alt="icon" />
          <div>
            {/* <p className={styles.brandTitle}>MILO</p> */}
            <p className={styles.brandSubtitle}>
              Modular Intelligence for Life Organization
            </p>
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
            <div>
              <p className={styles.profileName}>
                {displayName.trim() || user?.displayName}
              </p>
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
