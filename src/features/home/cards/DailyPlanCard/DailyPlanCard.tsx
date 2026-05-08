import { CheckSquare } from "phosphor-react";
import clsx from "clsx";

import { useAppSelector } from "@app/hooks";
import {
  isTaskOverdue,
  selectDoneTasks,
  selectTodayIncompleteTasks,
  type Task,
  type TaskPriority,
} from "@features/tasks";
import { selectTodayKey, useNow } from "@features/time";
import { Card } from "@shared/components/Card";

import styles from "../cards.module.scss";

type DailyPlanCardProps = {
  className?: string;
};

const prioritySections: Array<{
  label: string;
  priority: TaskPriority;
  sectionClassName: string;
}> = [
  {
    label: "Must",
    priority: "must",
    sectionClassName: styles.mustPrioritySection,
  },
  {
    label: "Should",
    priority: "should",
    sectionClassName: styles.shouldPrioritySection,
  },
  {
    label: "Could",
    priority: "could",
    sectionClassName: styles.couldPrioritySection,
  },
];

const isSameLocalDate = (dateValue: string, now: Date) => {
  const date = new Date(dateValue);

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

export const DailyPlanCard: React.FC<DailyPlanCardProps> = ({ className }) => {
  const doneTasks = useAppSelector(selectDoneTasks);
  const todayTasks = useAppSelector(selectTodayIncompleteTasks);
  const todayKey = useAppSelector(selectTodayKey);
  const now = useNow();
  const priorityBuckets = prioritySections.map((section) => ({
    ...section,
    tasks: todayTasks.filter((task) => task.priority === section.priority),
  }));
  const nextTodayTask =
    priorityBuckets.find((section) => section.tasks.length > 0)?.tasks[0] ??
    null;
  const completedTodayCount = doneTasks.filter(
    (task) => task.completedAt && isSameLocalDate(task.completedAt, now),
  ).length;

  const renderTask = (task: Task) => (
    <li className={styles.planPreviewItem} key={task.id}>
      <span className={styles.checkCircle} aria-hidden />
      <span>{task.content}</span>
      {isTaskOverdue(task, todayKey) ? (
        <span className={styles.overduePreviewChip}>Overdue</span>
      ) : null}
    </li>
  );

  return (
    <Card
      url="/plan"
      icon={<CheckSquare weight="duotone" />}
      title="Agenda"
      className={clsx(className)}
    >
      <div className={styles.planSummary}>
        {todayTasks.length > 0 ? (
          <p className={styles.planProgress}>
            {todayTasks.length} {todayTasks.length === 1 ? "thing" : "things"}{" "}
            for today
          </p>
        ) : null}

        {todayTasks.length > 0 && nextTodayTask ? (
          <>
            <p className={styles.cardMeta}>Next: {nextTodayTask.content}</p>
            <div
              className={styles.planPrioritySections}
              aria-label="Agenda priority groups"
            >
              {priorityBuckets.map((section) => (
                <section
                  className={clsx(
                    styles.planPrioritySection,
                    section.sectionClassName,
                  )}
                  key={section.priority}
                >
                  <div className={styles.planPriorityHeader}>
                    <h3>{section.label}</h3>
                    <span className={styles.priorityCount}>
                      {section.tasks.length}
                    </span>
                  </div>
                  {section.tasks.length > 0 ? (
                    <ul className={styles.planPreviewList}>
                      {section.tasks.map(renderTask)}
                    </ul>
                  ) : (
                    <p className={styles.emptyPriorityText}>Clear</p>
                  )}
                </section>
              ))}
            </div>
          </>
        ) : (
          <h3>
            {completedTodayCount > 0
              ? "You’re done for today. Nice work."
              : "No planned tasks yet. You can add one when you’re ready."}
          </h3>
        )}
      </div>
    </Card>
  );
};
