import { ArrowsClockwise, CheckCircle, Play, Target, X } from "phosphor-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useAppDispatch, useAppSelector } from "@app/hooks";
import {
  clearFocus,
  selectRecommendedFocusTask,
  skipFocusTask,
  startFocus,
  swapFocusTask,
} from "@features/focus";
import {
  completeTask,
  isTaskOverdue,
  selectTasks,
  undoCompleteTask,
  type Task,
} from "@features/tasks";
import { selectTodayKey } from "@features/time";
import { Button } from "@shared/components/Button";

import styles from "./FocusCard.module.scss";
import { FocusOrb } from "@features/home/FocusOrb";

type HomeToast = {
  message: string;
  undo?: () => void;
};

const getBestAlternativeTask = (tasks: Task[], currentTaskId: string) => {
  const availableTasks = tasks.filter(
    (task) => task.status === "todo" && task.id !== currentTaskId,
  );
  const priorityOrder: Task["priority"][] = ["must", "should", "could"];

  for (const priority of priorityOrder) {
    const task = availableTasks.find((item) => item.priority === priority);

    if (task) {
      return task;
    }
  }

  return null;
};

const priorityLabels: Record<Task["priority"], string> = {
  must: "Must Do",
  should: "Should Do",
  could: "Could Do",
};

export const FocusCard = () => {
  const dispatch = useAppDispatch();
  const focusTask = useAppSelector(selectRecommendedFocusTask);
  const tasks = useAppSelector(selectTasks);
  const todayKey = useAppSelector(selectTodayKey);
  const [toast, setToast] = useState<HomeToast | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 6000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  const handleStart = () => {
    if (!focusTask) {
      return;
    }

    dispatch(startFocus(focusTask.id));
    setToast({ message: "Ready when you are." });
  };

  const handleDone = () => {
    if (!focusTask) {
      return;
    }

    dispatch(completeTask(focusTask.id));
    dispatch(clearFocus());
    setToast({
      message: "Nice. That task is done.",
      undo: () => {
        dispatch(undoCompleteTask(focusTask.id));
        setToast({ message: "Task restored." });
      },
    });
  };

  const handleSwap = () => {
    if (!focusTask) {
      return;
    }

    const alternativeTask = getBestAlternativeTask(tasks, focusTask.id);

    if (!alternativeTask) {
      setToast({ message: "Nothing else is waiting. This might be the one." });
      return;
    }

    dispatch(swapFocusTask(focusTask.id));
    setToast({ message: "Moved to another next step." });
  };

  const handleSkip = () => {
    if (!focusTask) {
      return;
    }

    dispatch(skipFocusTask(focusTask.id));
    setToast({ message: "Skipped for now." });
  };

  return (
    <section className={styles.focusCard} aria-label="Focus recommendation">
      <div className={styles.focusArt}>
        <FocusOrb />
      </div>
      <div className={styles.focusHeader}>
        <div className={styles.focusHeaderBox}>
          {focusTask && (
            <span className={styles.priorityBadge}>
              {priorityLabels[focusTask.priority]}
            </span>
          )}
          {focusTask && isTaskOverdue(focusTask, todayKey) ? (
            <span className={styles.overdueBadge}>Overdue</span>
          ) : null}
          <div className={styles.focusHeaderTitle}>
            <span className={styles.icon}>
              <Target weight="duotone" />
            </span>
            <p className={styles.focusLabel}>Focus</p>
          </div>
        </div>
        <span className={styles.focusHint}>One clear next step</span>
      </div>

      <AnimatePresence mode="wait">
        {focusTask ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={styles.focusContent}
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 8 }}
            key={focusTask.id}
            transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
          >
            {/* <span className={styles.priorityBadge}>
              {priorityLabels[focusTask.priority]}
            </span> */}
            <h2>{focusTask.content}</h2>
            <p>Start here. Keep it small and visible.</p>
            <div className={styles.focusActions}>
              <Button
                icon={<Play weight="fill" />}
                onClick={handleStart}
                size="lg"
              >
                Start
              </Button>
              <Button
                icon={<CheckCircle weight="duotone" />}
                onClick={handleDone}
                size="lg"
                variant="secondary"
              >
                Done
              </Button>
              <Button
                icon={<ArrowsClockwise />}
                onClick={handleSwap}
                size="lg"
                variant="secondary"
              >
                Swap
              </Button>
              <Button
                icon={<X />}
                onClick={handleSkip}
                size="lg"
                variant="ghost"
              >
                Skip
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={styles.focusEmpty}
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 8 }}
            key="empty"
            transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
          >
            {/* <span className={styles.priorityBadge}>Clear</span> */}
            <h2>Nothing needs your focus right now.</h2>
            <p>Add something to your plan or enjoy the quiet.</p>
          </motion.div>
        )}
      </AnimatePresence>
      {toast ? (
        <div className={styles.inlineToast} role="status">
          <CheckCircle aria-hidden size={18} weight="fill" />
          <span>{toast.message}</span>
          {toast.undo ? (
            <button
              onClick={() => {
                toast.undo?.();
              }}
              type="button"
            >
              Undo
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};
