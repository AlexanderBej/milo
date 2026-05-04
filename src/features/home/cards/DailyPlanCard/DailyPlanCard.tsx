import { CheckSquare } from "phosphor-react";
import { Link } from "react-router-dom";

import { useAppSelector } from "@app/hooks";
import {
  isTaskOverdue,
  selectDoneTasks,
  selectNextTodayTask,
  selectTodayIncompleteTasks,
} from "@features/tasks";
import { selectTodayKey, useNow } from "@features/time";
import { Card } from "@shared/components/Card";

import styles from "../cards.module.scss";

const isSameLocalDate = (dateValue: string, now: Date) => {
  const date = new Date(dateValue);

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

export const DailyPlanCard = () => {
  const doneTasks = useAppSelector(selectDoneTasks);
  const todayTasks = useAppSelector(selectTodayIncompleteTasks);
  const nextTodayTask = useAppSelector(selectNextTodayTask);
  const todayKey = useAppSelector(selectTodayKey);
  const now = useNow();
  const previewTasks = todayTasks.slice(0, 3);
  const completedTodayCount = doneTasks.filter(
    (task) => task.completedAt && isSameLocalDate(task.completedAt, now),
  ).length;

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
          <>
            <p className={styles.cardMeta}>Next: {nextTodayTask.content}</p>
            <ul className={styles.planPreviewList}>
              {previewTasks.map((task) => (
                <li className={styles.planPreviewItem} key={task.id}>
                  <span className={styles.checkCircle} aria-hidden />
                  <span>{task.content}</span>
                  {isTaskOverdue(task, todayKey) ? (
                    <span className={styles.overduePreviewChip}>Overdue</span>
                  ) : null}
                </li>
              ))}
            </ul>
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
