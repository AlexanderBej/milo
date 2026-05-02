import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowsClockwise,
  CalendarBlank,
  Chalkboard,
  Check,
  CheckCircle,
  CheckSquare,
  DotsThreeVertical,
  ForkKnife,
  Lightning,
  Play,
  Target,
  Trash,
  Tray,
  Wallet,
  X,
} from "phosphor-react";

import { Button } from "@shared/components/Button";
import { Card } from "@shared/components/Card";
import styles from "./HomePage.module.scss";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import {
  addNote,
  deleteNote as deleteBoardNote,
  selectBoardNotes,
} from "@features/board";
import {
  removeCapture,
  restoreCapture,
  selectCaptureCount,
  selectCaptureItems,
} from "@features/quickCapture";
import {
  addTask,
  completeTask,
  deleteTask,
  selectDoneTasks,
  selectCouldTasks,
  selectMustTasks,
  selectShouldTasks,
  selectTasks,
  selectTodoTasks,
  undoCompleteTask,
} from "@features/tasks";
import type { Task } from "@features/tasks";
import {
  clearFocus,
  selectRecommendedFocusTask,
  skipFocusTask,
  startFocus,
  swapFocusTask,
} from "@features/focus";
import { NudgeCard as HomeNudgeCard } from "@features/nudges";
import { formatTimeAgo } from "@shared/utils";

const events = [
  { time: "10:00 AM", title: "Team stand-up", duration: "45 min" },
  { time: "1:00 PM", title: "Client call", duration: "60 min" },
  { time: "3:30 PM", title: "Design review", duration: "30 min" },
];

const recentExpenses = [
  { label: "Coffee", amount: "-$4.50" },
  { label: "Lunch", amount: "-$20.00" },
];

const MAX_PLAN_PREVIEW_ITEMS = 4;
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
          <TodayCard />
        </div>
        <div className={styles.rightColumn}>
          <HomeNudgeCard />
          <BoardCard />
          <InboxCard />
          <FoodCard />
          <MoneyCard />
        </div>
      </section>
    </main>
  );
};

const HomeHeader = () => {
  return (
    <header className={styles.header}>
      <div>
        <p className={styles.eyebrow}>Home</p>
        <h1>Good morning, James</h1>
        <p>Let&apos;s focus on what matters today.</p>
      </div>
      <Button icon={<Lightning weight="fill" />} variant="secondary">
        Focus Mode
      </Button>
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
  const mustTasks = useAppSelector(selectMustTasks);
  const shouldTasks = useAppSelector(selectShouldTasks);
  const couldTasks = useAppSelector(selectCouldTasks);
  const doneTasks = useAppSelector(selectDoneTasks);
  const todoTasks = useAppSelector(selectTodoTasks);
  const totalTasks = todoTasks.length + doneTasks.length;
  const sections = [
    { title: "Must Do", tasks: mustTasks },
    { title: "Should Do", tasks: shouldTasks },
    { title: "Could Do", tasks: couldTasks },
  ];

  return (
    <Card
      actions={
        <Link className={styles.cardTextLink} to="/plan">
          Open Plan
        </Link>
      }
      icon={<CheckSquare weight="duotone" />}
      title="Today’s Plan"
    >
      <div className={styles.planSummary}>
        {totalTasks > 0 ? (
          <p className={styles.planProgress}>
            {doneTasks.length} of {totalTasks} done
          </p>
        ) : null}
        {todoTasks.length > 0 ? (
          <div className={styles.planPreviewSections}>
            {sections.map((section) => (
              <PlanPreviewSection
                key={section.title}
                tasks={section.tasks}
                title={section.title}
              />
            ))}
          </div>
        ) : (
          <>
            <h3>
              {totalTasks > 0
                ? "You’re done for today. Nice work."
                : "Your plan is clear. Add something small when you’re ready."}
            </h3>
          </>
        )}
      </div>
    </Card>
  );
};

const getBoardDropPosition = (noteCount: number) => {
  const offset = noteCount % 7;

  return {
    x: 260 + offset * 36,
    y: 220 + offset * 36,
  };
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

type PlanPreviewSectionProps = {
  title: string;
  tasks: Task[];
};

const PlanPreviewSection = ({ title, tasks }: PlanPreviewSectionProps) => {
  const visibleTasks = tasks.slice(0, MAX_PLAN_PREVIEW_ITEMS);
  const hiddenCount = tasks.length - visibleTasks.length;

  return (
    <section className={styles.planPreviewSection}>
      <div className={styles.planPreviewHeader}>
        <h3>{title}</h3>
        <span>{tasks.length}</span>
      </div>
      {visibleTasks.length > 0 ? (
        <ul className={styles.planPreviewList}>
          {visibleTasks.map((task) => (
            <li className={styles.planPreviewItem} key={task.id}>
              <span className={styles.checkCircle} aria-hidden />
              <span>{task.content}</span>
            </li>
          ))}
          {hiddenCount > 0 ? (
            <li className={styles.moreTasks}>+{hiddenCount} more</li>
          ) : null}
        </ul>
      ) : (
        <p className={styles.planPreviewEmpty}>Nothing here yet.</p>
      )}
    </section>
  );
};

const TodayCard = () => {
  return (
    <Card icon={<CalendarBlank weight="duotone" />} title="Today">
      <ol className={styles.timeline}>
        {events.map((event) => (
          <li
            className={styles.timelineItem}
            key={`${event.time}-${event.title}`}
          >
            <span className={styles.timelineTime}>{event.time}</span>
            <span className={styles.timelineDot} aria-hidden />
            <div className={styles.timelineBody}>
              <p>{event.title}</p>
              <span>{event.duration}</span>
            </div>
          </li>
        ))}
      </ol>
      <Button className={styles.fullWidthButton} variant="ghost">
        View full schedule
      </Button>
    </Card>
  );
};

const InboxCard = () => {
  const dispatch = useAppDispatch();
  const captureCount = useAppSelector(selectCaptureCount);
  const captures = useAppSelector(selectCaptureItems);
  const boardNotes = useAppSelector(selectBoardNotes);
  const tasks = useAppSelector(selectTasks);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<HomeToast | null>(null);

  const buildHeader = (count: number) => {
    return count && count > 0
      ? `You have ${count.toString()} unsorted ${count === 1 ? "thought" : "thoughts"}`
      : "No loose thoughts right now.";
  };

  const handleMarkDone = (captureId: string) => {
    const index = captures.findIndex((item) => item.id === captureId);
    const capture = captures.find((item) => item.id === captureId);

    dispatch(removeCapture(captureId));
    setOpenMenuId(null);

    if (capture) {
      setToast({
        message: "Inbox item processed.",
        undo: () => {
          dispatch(restoreCapture({ item: capture, index }));
          setToast({ message: "Restored to Inbox." });
        },
      });
    }
  };

  const handleConvertToTask = (captureId: string) => {
    const index = captures.findIndex((item) => item.id === captureId);
    const capture = captures.find((item) => item.id === captureId);

    if (!capture) {
      return;
    }

    const taskAction = addTask({
      content: capture.content,
      priority: "should",
      source: "inbox",
    });

    dispatch(taskAction);
    dispatch(removeCapture(captureId));
    setOpenMenuId(null);
    setToast({
      message: "Task added to today.",
      undo: () => {
        dispatch(deleteTask(taskAction.payload.id));
        dispatch(restoreCapture({ item: capture, index }));
        setToast({ message: "Restored to Inbox." });
      },
    });
  };

  const handleSendToBoard = (captureId: string) => {
    const index = captures.findIndex((item) => item.id === captureId);
    const capture = captures.find((item) => item.id === captureId);

    if (!capture) {
      return;
    }

    const boardAction = addNote({
      content: capture.content,
      ...getBoardDropPosition(boardNotes.length),
    });

    dispatch(boardAction);
    dispatch(removeCapture(captureId));
    setOpenMenuId(null);
    setToast({
      message: "Sent to Board.",
      undo: () => {
        dispatch(deleteBoardNote(boardAction.payload.id));
        dispatch(restoreCapture({ item: capture, index }));
        setToast({ message: "Restored to Inbox." });
      },
    });
  };

  const handleDelete = (captureId: string) => {
    const index = captures.findIndex((item) => item.id === captureId);
    const capture = captures.find((item) => item.id === captureId);

    dispatch(removeCapture(captureId));
    setOpenMenuId(null);

    if (capture) {
      setToast({
        message: "Removed. Undo?",
        undo: () => {
          dispatch(restoreCapture({ item: capture, index }));
          setToast({ message: "Restored to Inbox." });
        },
      });
    }
  };

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

  useEffect(() => {
    if (!openMenuId) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Element &&
        !target.closest("[data-inbox-menu-root='true']")
      ) {
        setOpenMenuId(null);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [openMenuId]);

  return (
    <Card
      className={styles.inboxCard}
      icon={<Tray weight="duotone" />}
      title="Inbox"
      actions={[
        <span className={styles.cardMeta} key="count">
          {captureCount} waiting
        </span>,
      ]}
    >
      <div className={styles.messageStack}>
        <h3>{buildHeader(captureCount)}</h3>
        {captures.map((cap) => (
          <div className={styles.inboxBox} key={cap.id}>
            <div className={styles.columnFlex}>
              <span>{cap.content}</span>
              <span className={styles.timeAgo}>
                Captured {formatTimeAgo(cap.createdAt)}
              </span>
            </div>
            <div className={styles.inboxActions}>
              <button
                aria-label="Mark capture processed"
                className={styles.inboxIconButton}
                onClick={() => {
                  handleMarkDone(cap.id);
                }}
                type="button"
              >
                <Check aria-hidden size={18} weight="bold" />
              </button>
              <div className={styles.inboxMenuWrap} data-inbox-menu-root="true">
                <button
                  aria-expanded={openMenuId === cap.id}
                  aria-haspopup="menu"
                  aria-label="Open capture actions"
                  className={styles.inboxIconButton}
                  onClick={() => {
                    setOpenMenuId((currentId) =>
                      currentId === cap.id ? null : cap.id,
                    );
                  }}
                  type="button"
                >
                  <DotsThreeVertical aria-hidden size={20} weight="bold" />
                </button>
                {openMenuId === cap.id ? (
                  <div className={styles.inboxMenu} role="menu">
                    <button
                      className={styles.inboxMenuItem}
                      onClick={() => {
                        handleConvertToTask(cap.id);
                      }}
                      role="menuitem"
                      type="button"
                    >
                      <CheckSquare aria-hidden size={20} weight="duotone" />
                      <span>
                        <strong>Convert to Task</strong>
                        <small>Add to your plan</small>
                      </span>
                    </button>
                    <button
                      className={styles.inboxMenuItem}
                      onClick={() => {
                        handleSendToBoard(cap.id);
                      }}
                      role="menuitem"
                      type="button"
                    >
                      <Chalkboard aria-hidden size={20} weight="duotone" />
                      <span>
                        <strong>Send to Board</strong>
                        <small>Place as a note</small>
                      </span>
                    </button>
                    <button
                      className={styles.inboxMenuItemDanger}
                      onClick={() => {
                        handleDelete(cap.id);
                      }}
                      role="menuitem"
                      type="button"
                    >
                      <Trash aria-hidden size={20} weight="duotone" />
                      <span>
                        <strong>Delete</strong>
                        <small>Remove from inbox</small>
                      </span>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
        {toast ? (
          <div className={styles.cardToast} role="status">
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
      </div>
      {tasks.length === 0 && captureCount === 0 ? (
        <p className={styles.cardHint}>
          Capture a thought whenever something starts waiting.
        </p>
      ) : null}
    </Card>
  );
};

const FoodCard = () => {
  return (
    <Card icon={<ForkKnife weight="duotone" />} title="Food">
      <div className={styles.messageStack}>
        <h3>It&apos;s been a while since you ate.</h3>
        <p>How about a healthy lunch?</p>
      </div>
      <Button className={styles.fullWidthButton} size="sm" variant="secondary">
        Log a meal
      </Button>
    </Card>
  );
};

const MoneyCard = () => {
  return (
    <Card icon={<Wallet weight="duotone" />} title="Money">
      <div className={styles.spendHeader}>
        <span>Today&apos;s spend</span>
        <strong>$24.50 of $80</strong>
      </div>
      <div className={styles.progressTrack} aria-label="Today's spend progress">
        <span className={styles.progressFill} />
      </div>
      <div className={styles.recentList}>
        <p>Recent</p>
        {recentExpenses.map((expense) => (
          <div className={styles.expenseRow} key={expense.label}>
            <span>{expense.label}</span>
            <strong>{expense.amount}</strong>
          </div>
        ))}
      </div>
      <Button className={styles.fullWidthButton} size="sm" variant="secondary">
        Log expense
      </Button>
    </Card>
  );
};
