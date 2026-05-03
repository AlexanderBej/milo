import { useEffect } from "react";
import {
  CheckCircle,
  Pause,
  Play,
  Prohibit,
  Repeat,
  SignOut,
} from "phosphor-react";

import { useAppDispatch, useAppSelector } from "@app/hooks";
import {
  exitFocus,
  pauseFocus,
  resetFocusTimer,
  resumeFocus,
  selectFocusState,
  startBreak,
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
          <span className={styles.modeBadge}>{modeLabel}</span>
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
          <p className={styles.kicker}>Current task</p>
          <h2 id="focus-mode-title">{focusedTask.content}</h2>
          <div className={styles.timer} aria-live="polite">
            {formatRemainingTime(focus.remainingSeconds)}
          </div>

          {isFocusComplete ? (
            <div className={styles.statusPanel} role="status">
              <h3>Nice focus. Take 5?</h3>
              <Button
                icon={<Play weight="fill" />}
                onClick={() => dispatch(startBreak())}
                size="lg"
              >
                Start 5 min break
              </Button>
            </div>
          ) : null}

          {isBreakComplete ? (
            <div className={styles.statusPanel} role="status">
              <h3>Break complete</h3>
              <p>Ease back in when you are ready.</p>
            </div>
          ) : null}
        </div>

        <div className={styles.controls} aria-label="Focus controls">
          <Button
            disabled={isTimerComplete}
            icon={
              focus.isRunning ? <Pause weight="fill" /> : <Play weight="fill" />
            }
            onClick={handleToggleRunning}
            size="lg"
          >
            {focus.isRunning ? "Pause" : "Resume"}
          </Button>
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
          <Button
            icon={<Prohibit />}
            onClick={() => dispatch(exitFocus())}
            size="lg"
            variant="ghost"
          >
            Exit focus
          </Button>
        </div>
      </section>
    </div>
  );
};
