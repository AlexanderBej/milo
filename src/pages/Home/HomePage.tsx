import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowsClockwise,
  Chalkboard,
  CheckCircle,
  CheckSquare,
  Lightning,
  ListChecks,
  Play,
  Target,
  Tray,
  X,
} from "phosphor-react";

import { Button } from "@shared/components/Button";
import { Card } from "@shared/components/Card";
import styles from "./HomePage.module.scss";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { selectBoardNotes } from "@features/board";
import { selectCaptureCount, selectCaptureItems } from "@features/quickCapture";
import {
  completeTask,
  selectDoneTasks,
  selectTasks,
  selectTodoTasks,
  undoCompleteTask,
} from "@features/tasks";
import type { Task } from "@features/tasks";
import { selectDisplayName, selectNudgesEnabled } from "@features/preferences";
import { selectTodayRoutineProgress } from "@features/routines";
import {
  clearFocus,
  selectRecommendedFocusTask,
  skipFocusTask,
  startFocus,
  swapFocusTask,
} from "@features/focus";
import { NudgeCard as HomeNudgeCard } from "@features/nudges";
import { formatTimeAgo } from "@shared/utils";
import { getTaskPlanningSection } from "@shared/utils/planning";

const priorityLabels: Record<Task["priority"], string> = {
  must: "Must Do",
  should: "Should Do",
  could: "Could Do",
};

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

export const HomePage = () => {
  return (
    <main className={styles.mainContent}>
      <HomeHeader />
      <FocusCard />
      <section className={styles.supportingGrid} aria-label="Today overview">
        <div className={styles.leftColumn}>
          <DailyPlanCard />
        </div>
        <div className={styles.rightColumn}>
          <NudgePanel />
          <BoardCard />
          <InboxCard />
          <RoutinesCard />
        </div>
      </section>
    </main>
  );
};

const NudgePanel = () => {
  const nudgesEnabled = useAppSelector(selectNudgesEnabled);

  if (nudgesEnabled) {
    return <HomeNudgeCard />;
  }

  return (
    <Card icon={<Lightning weight="duotone" />} title="Nudges">
      <div className={styles.messageStack}>
        <h3>Nudges are quiet right now.</h3>
        <p>You can turn them back on in Settings.</p>
      </div>
    </Card>
  );
};

const HomeHeader = () => {
  const displayName = useAppSelector(selectDisplayName);
  const greetingName = displayName.trim() || "James";

  return (
    <header className={styles.header}>
      <div>
        <p className={styles.eyebrow}>Home</p>
        <h1>Good morning, {greetingName}</h1>
        <p>Let&apos;s focus on what matters today.</p>
      </div>
    </header>
  );
};

const FocusCard = () => {
  const dispatch = useAppDispatch();
  const focusTask = useAppSelector(selectRecommendedFocusTask);
  const tasks = useAppSelector(selectTasks);
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
      <div className={styles.focusHeader}>
        <p className={styles.focusLabel}>Focus</p>
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
            <span className={styles.priorityBadge}>
              {priorityLabels[focusTask.priority]}
            </span>
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
            <span className={styles.priorityBadge}>Clear</span>
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
      <div className={styles.focusMarker} aria-hidden>
        <Target weight="duotone" />
      </div>
    </section>
  );
};

const DailyPlanCard = () => {
  const doneTasks = useAppSelector(selectDoneTasks);
  const todoTasks = useAppSelector(selectTodoTasks);

  const todayTasks = todoTasks.filter(
    (task) => getTaskPlanningSection(task) === "today",
  );

  const soonTasks = todoTasks.filter(
    (task) => getTaskPlanningSection(task) === "soon",
  );

  const previewTasks = todayTasks.slice(0, 3);
  const soonPreviewTask = todayTasks.length < 2 ? soonTasks[0] : undefined;

  return (
    <Card
      actions={
        <Link className={styles.cardTextLink} to="/plan">
          Open Agenda
        </Link>
      }
      icon={<CheckSquare weight="duotone" />}
      title="Agenda"
    >
      <div className={styles.planSummary}>
        {todayTasks.length > 0 ? (
          <p className={styles.planProgress}>
            {todayTasks.length} {todayTasks.length === 1 ? "thing" : "things"}{" "}
            for today
          </p>
        ) : null}

        {previewTasks.length > 0 ? (
          <ul className={styles.planPreviewList}>
            {previewTasks.map((task) => (
              <li className={styles.planPreviewItem} key={task.id}>
                <span className={styles.checkCircle} aria-hidden />
                <span>{task.content}</span>
              </li>
            ))}
          </ul>
        ) : (
          <h3>
            {doneTasks.length > 0
              ? "You’re done for today. Nice work."
              : "Nothing planned for today. Add one gentle next step."}
          </h3>
        )}

        {soonPreviewTask ? (
          <p className={styles.cardHint}>Soon: {soonPreviewTask.content}</p>
        ) : null}
      </div>
    </Card>
  );
};

const BoardCard = () => {
  const notes = useAppSelector(selectBoardNotes);
  const visibleNotes = notes.slice(-3).reverse();

  return (
    <Card
      actions={
        <Link className={styles.cardTextLink} to="/board">
          Open Board
        </Link>
      }
      icon={<Chalkboard weight="duotone" />}
      title="Board"
    >
      <div className={styles.boardPreview}>
        {notes.length > 0 ? (
          <>
            <p className={styles.planProgress}>
              {notes.length} {notes.length === 1 ? "note" : "notes"} waiting
            </p>
            <ul className={styles.boardPreviewList}>
              {visibleNotes.map((note) => (
                <li key={note.id}>{note.content || "Empty thought"}</li>
              ))}
            </ul>
          </>
        ) : (
          <h3>Drop a thought here. You can organize it later.</h3>
        )}
      </div>
    </Card>
  );
};

const InboxCard = () => {
  const captureCount = useAppSelector(selectCaptureCount);
  const captures = useAppSelector(selectCaptureItems);
  const tasks = useAppSelector(selectTasks);
  const visibleCaptures = captures.slice(0, 2);

  return (
    <Card
      actions={
        <Link className={styles.cardTextLink} to="/inbox">
          Open Inbox
        </Link>
      }
      icon={<Tray weight="duotone" />}
      title="Inbox"
    >
      <div className={styles.messageStack}>
        <h3>
          {captureCount > 0
            ? `${captureCount.toString()} ${captureCount === 1 ? "thought is" : "thoughts are"} waiting.`
            : "No loose thoughts right now."}
        </h3>
        {visibleCaptures.length > 0 ? (
          <ul className={styles.boardPreviewList}>
            {visibleCaptures.map((capture) => (
              <li key={capture.id}>
                {capture.content} · {formatTimeAgo(capture.createdAt)}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {tasks.length === 0 && captureCount === 0 ? (
        <p className={styles.cardHint}>
          Capture a thought whenever something starts waiting.
        </p>
      ) : null}
    </Card>
  );
};

const RoutinesCard = () => {
  const todayProgress = useAppSelector(selectTodayRoutineProgress);
  const visibleRoutines = todayProgress.slice(0, 2);
  const completedCount = todayProgress.filter((item) => item.isComplete).length;

  return (
    <Card
      actions={
        <Link className={styles.cardTextLink} to="/routines">
          Open Routines
        </Link>
      }
      icon={<ListChecks weight="duotone" />}
      title="Routines"
    >
      <div className={styles.messageStack}>
        <h3>
          {todayProgress.length > 0
            ? `${completedCount.toString()} of ${todayProgress.length.toString()} routines cleared today.`
            : "No routines waiting today."}
        </h3>
        {visibleRoutines.length > 0 ? (
          <ul className={styles.planPreviewList}>
            {visibleRoutines.map(({ routine, isComplete }) => (
              <li className={styles.planPreviewItem} key={routine.id}>
                <span className={styles.checkCircle} aria-hidden />
                <span>
                  {routine.title}
                  {isComplete ? " · done" : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Routines stay tucked away until you need them.</p>
        )}
      </div>
    </Card>
  );
};
