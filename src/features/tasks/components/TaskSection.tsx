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
  todayKey: string;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onPriorityChange: (taskId: string, priority: TaskPriority) => void;
  onUndo?: (taskId: string) => void;
  onPlanningChange: (
    taskId: string,
    bucket: NonNullable<Task["planningBucket"]>,
  ) => void;
};

export const TaskSection = ({
  title,
  helper,
  emptyText,
  tasks,
  todayKey,
  onComplete,
  onDelete,
  onPriorityChange,
  onPlanningChange,
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
                onPriorityChange={onPriorityChange}
                onPlanningChange={onPlanningChange}
                onUndo={onUndo}
                task={task}
                todayKey={todayKey}
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
