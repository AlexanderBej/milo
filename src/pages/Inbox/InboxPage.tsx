import { useEffect, useState } from "react";
import {
  Chalkboard,
  Check,
  CheckCircle,
  CheckSquare,
  DotsThreeVertical,
  Trash,
  Tray,
} from "phosphor-react";

import { useAppDispatch, useAppSelector } from "@app/hooks";
import {
  addNote,
  deleteNote as deleteBoardNote,
  selectBoardNotes,
} from "@features/board";
import {
  processCapture,
  restoreCapture,
  selectActiveInboxCaptures,
  selectCaptureCount,
  softDeleteCapture,
} from "@features/quickCapture";
import { addTask, deleteTask, selectTasks } from "@features/tasks";
import {
  selectDefaultInboxPriority,
  selectMustDoLimit,
} from "@features/preferences";
import { formatRelativeTime, useNow } from "@features/time";
import { Card } from "@shared/components/Card";
import { getTodayDateString } from "@shared/utils/planning";
import styles from "./InboxPage.module.scss";

type InboxToast = {
  message: string;
  undo?: () => void;
};

const getBoardDropPosition = (noteCount: number) => {
  const offset = noteCount % 7;

  return {
    x: 260 + offset * 36,
    y: 220 + offset * 36,
  };
};

export const InboxPage = () => {
  const dispatch = useAppDispatch();
  const captureCount = useAppSelector(selectCaptureCount);
  const captures = useAppSelector(selectActiveInboxCaptures);
  const boardNotes = useAppSelector(selectBoardNotes);
  const defaultInboxPriority = useAppSelector(selectDefaultInboxPriority);
  const mustDoLimit = useAppSelector(selectMustDoLimit);
  const tasks = useAppSelector(selectTasks);
  const now = useNow();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<InboxToast | null>(null);

  const handleMarkDone = (captureId: string) => {
    const index = captures.findIndex((item) => item.id === captureId);
    const capture = captures.find((item) => item.id === captureId);

    dispatch(processCapture(captureId));
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
      maxMustDoLimit: mustDoLimit,
      priority: defaultInboxPriority,
      source: "inbox",
      planningBucket: "today",
      dueDate: getTodayDateString(),
      timeSlot: "anytime",
    });

    dispatch(taskAction);
    dispatch(processCapture(captureId));
    setOpenMenuId(null);
    setToast({
      message: "Task added to Agenda.",
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
    dispatch(processCapture(captureId));
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

    dispatch(softDeleteCapture(captureId));
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
    <main className={styles.mainContent}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Inbox</p>
          <h1>Loose thoughts</h1>
          <p>Turn captures into the next place they belong.</p>
        </div>
      </header>

      <Card
        actions={[
          <span className={styles.cardMeta} key="count">
            {captureCount} waiting
          </span>,
        ]}
        icon={<Tray weight="duotone" />}
        title="Inbox"
      >
        <div className={styles.messageStack}>
          <h2>
            {captureCount > 0
              ? `You have ${captureCount.toString()} unsorted ${captureCount === 1 ? "thought" : "thoughts"}.`
              : "No loose thoughts right now."}
          </h2>

          {captures.map((capture) => (
            <div className={styles.inboxBox} key={capture.id}>
              <div className={styles.columnFlex}>
                <span>{capture.content}</span>
                <span className={styles.timeAgo}>
                  Captured {formatRelativeTime(capture.createdAt, now)}
                </span>
              </div>
              <div className={styles.inboxActions}>
                <button
                  aria-label="Mark capture processed"
                  className={styles.inboxIconButton}
                  onClick={() => {
                    handleMarkDone(capture.id);
                  }}
                  type="button"
                >
                  <Check aria-hidden size={18} weight="bold" />
                </button>
                <div
                  className={styles.inboxMenuWrap}
                  data-inbox-menu-root="true"
                >
                  <button
                    aria-expanded={openMenuId === capture.id}
                    aria-haspopup="menu"
                    aria-label="Open capture actions"
                    className={styles.inboxIconButton}
                    onClick={() => {
                      setOpenMenuId((currentId) =>
                        currentId === capture.id ? null : capture.id,
                      );
                    }}
                    type="button"
                  >
                    <DotsThreeVertical aria-hidden size={20} weight="bold" />
                  </button>
                  {openMenuId === capture.id ? (
                    <div className={styles.inboxMenu} role="menu">
                      <button
                        className={styles.inboxMenuItem}
                        onClick={() => {
                          handleConvertToTask(capture.id);
                        }}
                        role="menuitem"
                        type="button"
                      >
                        <CheckSquare aria-hidden size={20} weight="duotone" />
                        <span>
                          <strong>Convert to Task</strong>
                          <small>Add to Agenda</small>
                        </span>
                      </button>
                      <button
                        className={styles.inboxMenuItem}
                        onClick={() => {
                          handleSendToBoard(capture.id);
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
                          handleDelete(capture.id);
                        }}
                        role="menuitem"
                        type="button"
                      >
                        <Trash aria-hidden size={20} weight="duotone" />
                        <span>
                          <strong>Delete</strong>
                          <small>Remove from Inbox</small>
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
    </main>
  );
};
