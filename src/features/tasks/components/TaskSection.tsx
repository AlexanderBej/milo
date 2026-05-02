import { AnimatePresence } from "framer-motion";

import { Card } from "@shared/components/Card";
import type { Task, TaskPriority } from "../types";
import { TaskItem } from "./TaskItem";
import styles from "./TaskSection.module.scss";

type TaskSectionProps = {
  title: string;
  helper: string;
  emptyText: string;
  tasks: Task[];
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onMove?: (taskId: string, direction: "up" | "down") => void;
  onPriorityChange: (taskId: string, priority: TaskPriority) => void;
  onUndo?: (taskId: string) => void;
};

export const TaskSection = ({
  title,
  helper,
  emptyText,
  tasks,
  onComplete,
  onDelete,
  onMove,
  onPriorityChange,
  onUndo,
}: TaskSectionProps) => {
  return (
    <Card className={styles.section} subtitle={helper} title={title}>
      {tasks.length > 0 ? (
        <ul className={styles.list}>
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                onComplete={onComplete}
                onDelete={onDelete}
                onMove={onMove}
                onPriorityChange={onPriorityChange}
                onUndo={onUndo}
                task={task}
              />
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <p className={styles.empty}>{emptyText}</p>
      )}
    </Card>
  );
};
