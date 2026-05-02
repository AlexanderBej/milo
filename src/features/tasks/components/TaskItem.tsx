import { ArrowDown, ArrowUp, Check, Trash, X } from "phosphor-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

import type { Task, TaskPriority } from "../types";
import styles from "./TaskItem.module.scss";

const priorities: Array<{ label: string; value: TaskPriority }> = [
  { label: "Must", value: "must" },
  { label: "Should", value: "should" },
  { label: "Could", value: "could" },
];

type TaskItemProps = {
  task: Task;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onMove?: (taskId: string, direction: "up" | "down") => void;
  onPriorityChange: (taskId: string, priority: TaskPriority) => void;
  onUndo?: (taskId: string) => void;
};

export const TaskItem = ({
  task,
  onComplete,
  onDelete,
  onMove,
  onPriorityChange,
  onUndo,
}: TaskItemProps) => {
  const isDone = task.status === "done";

  return (
    <motion.li
      animate={{ opacity: 1, y: 0 }}
      className={clsx(styles.item, isDone && styles.done)}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      initial={{ opacity: 0, y: 8 }}
      layout
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className={styles.contentWrap}>
        <p className={styles.content}>{task.content}</p>
        {!isDone ? (
          <div className={styles.priorityControls} aria-label="Task priority">
            {priorities.map((priority) => (
              <button
                aria-pressed={task.priority === priority.value}
                className={clsx(
                  styles.priorityButton,
                  task.priority === priority.value &&
                    styles.priorityButtonActive,
                )}
                key={priority.value}
                onClick={() => {
                  onPriorityChange(task.id, priority.value);
                }}
                type="button"
              >
                {priority.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className={styles.actions}>
        {!isDone && onMove ? (
          <>
            <button
              aria-label="Move task up"
              className={styles.iconButton}
              onClick={() => {
                onMove(task.id, "up");
              }}
              type="button"
            >
              <ArrowUp aria-hidden size={18} weight="bold" />
            </button>
            <button
              aria-label="Move task down"
              className={styles.iconButton}
              onClick={() => {
                onMove(task.id, "down");
              }}
              type="button"
            >
              <ArrowDown aria-hidden size={18} weight="bold" />
            </button>
          </>
        ) : null}
        {isDone ? (
          <button
            aria-label="Undo completed task"
            className={styles.iconButton}
            onClick={() => {
              onUndo?.(task.id);
            }}
            type="button"
          >
            <X aria-hidden size={18} weight="bold" />
          </button>
        ) : (
          <button
            aria-label="Mark task done"
            className={styles.iconButton}
            onClick={() => {
              onComplete(task.id);
            }}
            type="button"
          >
            <Check aria-hidden size={18} weight="bold" />
          </button>
        )}
        <button
          aria-label="Delete task"
          className={styles.iconButtonDanger}
          onClick={() => {
            onDelete(task.id);
          }}
          type="button"
        >
          <Trash aria-hidden size={18} weight="duotone" />
        </button>
      </div>
    </motion.li>
  );
};
