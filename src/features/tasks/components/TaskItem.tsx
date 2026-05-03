import { ArrowDown, ArrowUp, Check, Trash, X } from "phosphor-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

import type { Task, TaskPriority } from "../types";
import styles from "./TaskItem.module.scss";
import {
  getTodayDateString,
  getTomorrowDateString,
} from "@shared/utils/planning";

const priorities: Array<{ label: string; value: TaskPriority }> = [
  { label: "Must", value: "must" },
  { label: "Should", value: "should" },
  { label: "Could", value: "could" },
];

const timeSlotLabels: Record<string, string> = {
  anytime: "Anytime",
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

const planningBucketLabels: Record<string, string> = {
  today: "Today",
  soon: "Soon",
  later: "Later",
  someday: "Someday",
};

const getTaskDateLabel = (task: Task) => {
  if (task.dueDate === getTodayDateString()) return "Today";
  if (task.dueDate === getTomorrowDateString()) return "Tomorrow";

  return task.planningBucket
    ? planningBucketLabels[task.planningBucket]
    : "Today";
};

const getTaskMetaLabel = (task: Task) => {
  const dateLabel = getTaskDateLabel(task);
  const timeSlotLabel = task.timeSlot
    ? timeSlotLabels[task.timeSlot]
    : undefined;

  return [dateLabel, timeSlotLabel].filter(Boolean).join(" • ");
};

type TaskItemProps = {
  task: Task;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onMove?: (taskId: string, direction: "up" | "down") => void;
  onPriorityChange: (taskId: string, priority: TaskPriority) => void;
  onPlanningChange: (
    taskId: string,
    bucket: NonNullable<Task["planningBucket"]>,
  ) => void;
  onUndo?: (taskId: string) => void;
};

export const TaskItem = ({
  task,
  onComplete,
  onDelete,
  onMove,
  onPriorityChange,
  onPlanningChange,
  onUndo,
}: TaskItemProps) => {
  const isDone = task.status === "done";
  const metaLabel = getTaskMetaLabel(task);

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
        <p className={styles.meta}>{metaLabel}</p>
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
        <select
          className={styles.metaSelect}
          value={task.planningBucket ?? "today"}
          onChange={(event) => {
            onPlanningChange(
              task.id,
              event.target.value as NonNullable<Task["planningBucket"]>,
            );
          }}
          aria-label="Move task to planning section"
        >
          <option value="today">Today</option>
          <option value="soon">Soon</option>
          <option value="later">Later</option>
          <option value="someday">Someday</option>
        </select>
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
