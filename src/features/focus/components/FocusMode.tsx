import { useEffect } from "react";
import { CheckCircle, Pause, Play, Repeat, SignOut } from "phosphor-react";

import { useAppDispatch, useAppSelector } from "@app/hooks";
import {
  exitFocus,
  pauseFocus,
  resetFocusTimer,
  resumeFocus,
  selectFocusState,
  startBreak,
  startNextFocus,
  tickFocus,
} from "@features/focus";
import { completeTask, selectTasks } from "@features/tasks";
import { Button } from "@shared/components/Button";
import styles from "./FocusMode.module.scss";

type FocusModeProps = {
  onComplete?: () => void;
};

const formatRemainingTime = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

export const FocusMode = ({ onComplete }: FocusModeProps) => {
  const dispatch = useAppDispatch();
  const focus = useAppSelector(selectFocusState);
  const tasks = useAppSelector(selectTasks);
  const focusedTask = tasks.find((task) => task.id === focus.currentTaskId);

  useEffect(() => {
    if (!focus.currentTaskId || focusedTask) {
      return;
    }

    dispatch(exitFocus());
  }, [dispatch, focus.currentTaskId, focusedTask]);

  useEffect(() => {
    if (!focus.currentTaskId || !focus.isRunning) {
      return;
    }

    const timer = window.setInterval(() => {
      dispatch(tickFocus());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [dispatch, focus.currentTaskId, focus.isRunning]);

  useEffect(() => {
    if (!focus.currentTaskId) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dispatch(exitFocus());
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch, focus.currentTaskId]);

  if (!focus.currentTaskId || !focusedTask) {
    return null;
  }

  const isTimerComplete = focus.remainingSeconds === 0;
  const isFocusComplete = focus.mode === "focus" && isTimerComplete;
  const isBreakComplete = focus.mode === "break" && isTimerComplete;
  const modeLabel = focus.mode === "focus" ? "Focus" : "Break";

  const handleToggleRunning = () => {
    if (focus.isRunning) {
      dispatch(pauseFocus());
      return;
    }

    if (isFocusComplete) {
      dispatch(startBreak());
      return;
    }

    if (isBreakComplete) {
      dispatch(startNextFocus());
      return;
    }

    dispatch(resumeFocus());
  };

  const handleComplete = () => {
    dispatch(completeTask(focusedTask.id));
    dispatch(exitFocus());
    onComplete?.();
  };

  return (
    <div className={styles.backdrop} role="presentation">
      <section
        aria-labelledby="focus-mode-title"
        aria-modal="true"
        className={styles.dialog}
        role="dialog"
      >
        <div className={styles.topBar}>
          <span className={styles.kicker}>{modeLabel} mode</span>
          <Button
            icon={<SignOut />}
            onClick={() => dispatch(exitFocus())}
            size="sm"
            variant="ghost"
          >
            Exit focus
          </Button>
        </div>

        <div className={styles.centerStage}>
          <p className={styles.kicker}>{modeLabel} mode</p>
          <h2 id="focus-mode-title">{focusedTask.content}</h2>
          <p className={styles.description}>{focusedTask.description}</p>
          <div className={styles.timer} aria-live="polite">
            {formatRemainingTime(focus.remainingSeconds)}
          </div>

          {isFocusComplete ? (
            <div className={styles.statusPanel} role="status">
              <h3>Nice focus. Take a break?</h3>
              <Button
                icon={<Play weight="fill" />}
                onClick={() => dispatch(startBreak())}
                size="lg"
              >
                Start break
              </Button>
            </div>
          ) : null}

          {isBreakComplete ? (
            <div className={styles.statusPanel} role="status">
              <h3>Ready for another round?</h3>
              <div className={styles.promptActions}>
                <Button
                  icon={<Play weight="fill" />}
                  onClick={() => dispatch(startNextFocus())}
                  size="lg"
                >
                  Start focus
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <div className={styles.controls} aria-label="Focus controls">
          {!isTimerComplete ? (
            <Button
              icon={
                focus.isRunning ? (
                  <Pause weight="fill" />
                ) : (
                  <Play weight="fill" />
                )
              }
              onClick={handleToggleRunning}
              size="lg"
            >
              {focus.isRunning ? "Pause" : "Resume"}
            </Button>
          ) : null}
          <Button
            icon={<Repeat />}
            onClick={() => dispatch(resetFocusTimer())}
            size="lg"
            variant="secondary"
          >
            Reset timer
          </Button>
          <Button
            icon={<CheckCircle weight="duotone" />}
            onClick={handleComplete}
            size="lg"
            variant="secondary"
          >
            Complete task
          </Button>
        </div>
      </section>
    </div>
  );
};
