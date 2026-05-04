import { useId, useState } from "react";
import { Check, Trash, X } from "phosphor-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { clsx } from "clsx";

import { getOverdueDueLabel, isTaskOverdue } from "../taskUtils";
import type { Task, TaskPriority } from "../types";
import styles from "./TaskItem.module.scss";
import { Select } from "@shared/components/Select";
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
  todayKey: string;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onPriorityChange: (taskId: string, priority: TaskPriority) => void;
  onPlanningChange: (
    taskId: string,
    bucket: NonNullable<Task["planningBucket"]>,
  ) => void;
  onUndo?: (taskId: string) => void;
};

export const TaskItem = ({
  task,
  todayKey,
  onComplete,
  onDelete,
  onPriorityChange,
  onPlanningChange,
  onUndo,
}: TaskItemProps) => {
  const isDone = task.status === "done";
  const isOverdue = isTaskOverdue(task, todayKey);
  const metaLabel = getTaskMetaLabel(task);
  const detailsId = useId();
  const shouldReduceMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(true);
  const detailsTransition = {
    duration: shouldReduceMotion ? 0 : 0.2,
    ease: "easeOut" as const,
  };

  return (
    <motion.li
      animate={{ opacity: 1, y: 0 }}
      className={clsx(styles.item, isDone && styles.done)}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      initial={{ opacity: 0, y: 8 }}
      layout
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className={styles.header}>
        <div className={styles.textBlock}>
          <button
            aria-controls={detailsId}
            aria-expanded={isExpanded}
            className={styles.titleButton}
            onClick={() => {
              setIsExpanded((current) => !current);
            }}
            type="button"
          >
            {task.content}
          </button>
          {isOverdue && task.dueDate ? (
            <span
              className={styles.overdueChip}
              title={getOverdueDueLabel(task.dueDate, todayKey)}
            >
              Overdue
            </span>
          ) : null}
        </div>

        <div className={styles.actions}>
          {isDone ? (
            <button
              aria-label="Undo completed task"
              className={styles.iconButton}
              onClick={() => onUndo?.(task.id)}
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
      </div>

      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            className={styles.details}
            exit={{ height: 0, opacity: 0 }}
            id={detailsId}
            initial={{ height: 0, opacity: 0 }}
            role="region"
            transition={detailsTransition}
          >
            <div className={styles.detailsInner}>
              {task.description ? (
                <p className={styles.description}>{task.description}</p>
              ) : null}

              <p className={styles.meta}>{metaLabel}</p>

              {!isDone ? (
                <div className={styles.controls}>
                  <div
                    className={styles.priorityControls}
                    aria-label="Task priority"
                  >
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

                  <Select
                    aria-label="Move task to planning section"
                    className={styles.planningSelect}
                    onChange={(event) => {
                      onPlanningChange(
                        task.id,
                        event.target.value as NonNullable<
                          Task["planningBucket"]
                        >,
                      );
                    }}
                    value={task.planningBucket ?? "today"}
                    variant="pill"
                  >
                    <option value="today">Today</option>
                    <option value="soon">Soon</option>
                    <option value="later">Later</option>
                    <option value="someday">Someday</option>
                  </Select>
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.li>
  );
};
