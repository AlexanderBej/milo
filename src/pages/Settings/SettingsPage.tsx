import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Bell,
  Database,
  DownloadSimple,
  GearSix,
  PaintBrush,
  SignOut,
  Sliders,
  Trash,
} from "phosphor-react";
import { signOut } from "firebase/auth";

import { useAppDispatch, useAppSelector } from "@app/hooks";
import { setBoardAreas, setBoardNotes } from "@features/board";
import { clearFocus } from "@features/focus";
import {
  selectPreferences,
  updatePreferences,
  type LayoutDensity,
  type PreferencePriority,
  type StartScreen,
} from "@features/preferences";
import { setCaptures } from "@features/quickCapture";
import { setRoutineCompletions, setRoutines } from "@features/routines";
import { setTasks } from "@features/tasks";
import { auth } from "@services/firebase/firebaseAuth";
import { Button } from "@shared/components/Button";
import { Card } from "@shared/components/Card";
import { Select } from "@shared/components/Select";
import styles from "./SettingsPage.module.scss";

const startScreenOptions: Array<{ label: string; value: StartScreen }> = [
  { label: "Home", value: "home" },
  { label: "Inbox", value: "inbox" },
  { label: "Daily Plan", value: "plan" },
  { label: "Focus", value: "focus" },
  { label: "Board", value: "board" },
];

const priorityOptions: Array<{ label: string; value: PreferencePriority }> = [
  { label: "Must", value: "must" },
  { label: "Should", value: "should" },
  { label: "Could", value: "could" },
];

const snoozeOptions = [15, 30, 60, 120];

export const SettingsPage = () => {
  const dispatch = useAppDispatch();
  const preferences = useAppSelector(selectPreferences);
  const boardState = useAppSelector((appState) => appState.board);
  const focusState = useAppSelector((appState) => appState.focus);
  const quickCaptureState = useAppSelector((appState) => appState.quickCapture);
  const tasksState = useAppSelector((appState) => appState.tasks);
  const hasMounted = useRef(false);
  const [saveMessage, setSaveMessage] = useState("Saved automatically");
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    setSaveMessage("Saved");

    const timer = window.setTimeout(() => {
      setSaveMessage("Saved automatically");
    }, 1800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [preferences]);

  const updateDisplayName = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(updatePreferences({ displayName: event.target.value }));
  };

  const exportJson = () => {
    const exportState = {
      board: boardState,
      focus: focusState,
      preferences,
      quickCapture: quickCaptureState,
      tasks: tasksState,
    };
    const blob = new Blob([JSON.stringify(exportState, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `milo-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetLocalData = () => {
    const confirmed = window.confirm(
      "Clear local session data on this device? Firebase data will not be deleted.",
    );

    if (!confirmed) {
      return;
    }

    dispatch(setCaptures([]));
    dispatch(setTasks([]));
    dispatch(setBoardAreas([]));
    dispatch(setBoardNotes([]));
    dispatch(setRoutines([]));
    dispatch(setRoutineCompletions([]));
    dispatch(clearFocus());
    window.sessionStorage.removeItem("milo:nudges:hidden");
    setSaveMessage("Local session data cleared");
  };

  const handleSignOut = () => {
    if (!auth || isSigningOut) {
      return;
    }

    setSignOutError(null);
    setIsSigningOut(true);

    void signOut(auth)
      .catch((error: unknown) => {
        console.error("Failed to sign out.", error);
        setSignOutError("Sign out failed. Please try again.");
      })
      .finally(() => {
        setIsSigningOut(false);
      });
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Settings</p>
          <h1>Preferences</h1>
          <p>Small adjustments so MILO feels easier to come back to.</p>
        </div>
        <div className={styles.saveStatus} role="status">
          {saveMessage}
        </div>
      </header>

      <section className={styles.grid} aria-label="MILO preferences">
        <Card icon={<GearSix weight="duotone" />} title="General">
          <div className={styles.fieldStack}>
            <label className={styles.field}>
              <span>What should MILO call you?</span>
              <input
                className={styles.input}
                onChange={updateDisplayName}
                placeholder="Your name"
                type="text"
                value={preferences.displayName}
              />
            </label>

            <label className={styles.field} htmlFor="default-start-screen">
              <span>Where should MILO open first?</span>
              <Select
                id="default-start-screen"
                onChange={(event) => {
                  dispatch(
                    updatePreferences({
                      defaultStartScreen: event.target.value as StartScreen,
                    }),
                  );
                }}
                value={preferences.defaultStartScreen}
              >
                {startScreenOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        </Card>

        <Card icon={<PaintBrush weight="duotone" />} title="Appearance">
          <div className={styles.fieldStack}>
            <p className={styles.infoText}>
              MILO uses a calm dark theme for now.
            </p>
            <label className={styles.field} htmlFor="layout-density">
              <span>Layout density</span>
              <Select
                id="layout-density"
                onChange={(event) => {
                  dispatch(
                    updatePreferences({
                      layoutDensity: event.target.value as LayoutDensity,
                    }),
                  );
                }}
                value={preferences.layoutDensity}
              >
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </Select>
            </label>
          </div>
        </Card>

        <Card icon={<Sliders weight="duotone" />} title="Planning">
          <div className={styles.fieldStack}>
            <label className={styles.field} htmlFor="must-do-limit">
              <span>Must Do limit</span>
              <Select
                id="must-do-limit"
                onChange={(event) => {
                  dispatch(
                    updatePreferences({
                      mustDoLimit: Number(event.target.value),
                    }),
                  );
                }}
                value={preferences.mustDoLimit}
              >
                {[1, 2, 3, 4, 5].map((limit) => (
                  <option key={limit} value={limit}>
                    {limit}
                  </option>
                ))}
              </Select>
            </label>

            <label className={styles.field} htmlFor="default-inbox-priority">
              <span>Default task priority from Inbox</span>
              <Select
                id="default-inbox-priority"
                onChange={(event) => {
                  dispatch(
                    updatePreferences({
                      defaultInboxPriority: event.target
                        .value as PreferencePriority,
                    }),
                  );
                }}
                value={preferences.defaultInboxPriority}
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        </Card>

        <Card icon={<Bell weight="duotone" />} title="Nudges">
          <div className={styles.fieldStack}>
            <label className={styles.switchField}>
              <span>Enable nudges</span>
              <input
                checked={preferences.nudgesEnabled}
                onChange={(event) => {
                  dispatch(
                    updatePreferences({ nudgesEnabled: event.target.checked }),
                  );
                }}
                type="checkbox"
              />
            </label>
            <p className={styles.infoText}>
              Nudges should feel supportive, not pushy.
            </p>
            <label className={styles.field} htmlFor="nudge-snooze-minutes">
              <span>Snooze duration</span>
              <Select
                id="nudge-snooze-minutes"
                onChange={(event) => {
                  dispatch(
                    updatePreferences({
                      nudgeSnoozeMinutes: Number(event.target.value),
                    }),
                  );
                }}
                value={preferences.nudgeSnoozeMinutes}
              >
                {snoozeOptions.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} min
                  </option>
                ))}
              </Select>
            </label>
          </div>
        </Card>

        <Card icon={<Database weight="duotone" />} title="Data">
          <div className={styles.fieldStack}>
            <p className={styles.infoText}>
              Sync is handled automatically when Firebase is configured.
            </p>
            <div className={styles.buttonRow}>
              <Button
                icon={<DownloadSimple weight="bold" />}
                onClick={exportJson}
                variant="secondary"
              >
                Export JSON
              </Button>
              <Button
                icon={<Trash weight="bold" />}
                onClick={resetLocalData}
                variant="ghost"
              >
                Clear local session data
              </Button>
            </div>
          </div>
        </Card>

        <Card icon={<SignOut weight="duotone" />} title="Account">
          <div className={styles.fieldStack}>
            <p className={styles.infoText}>
              Sign out of this browser when you are done.
            </p>
            <div>
              <Button
                icon={<SignOut weight="bold" />}
                onClick={handleSignOut}
                variant="secondary"
                disabled={!auth || isSigningOut}
              >
                {isSigningOut ? "Signing out..." : "Sign out"}
              </Button>
            </div>
            {signOutError ? (
              <p className={styles.errorText} role="alert">
                {signOutError}
              </p>
            ) : null}
          </div>
        </Card>
      </section>
    </main>
  );
};
