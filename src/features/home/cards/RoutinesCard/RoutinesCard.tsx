/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Link } from "react-router-dom";
import { ListChecks } from "phosphor-react";
import { clsx } from "clsx";

import { useAppSelector } from "@app/hooks";
import { Card } from "@shared/components/Card";
import {
  selectActiveRoutineForNow,
  selectTodayRoutineProgress,
  selectUpcomingRoutineForNow,
} from "@features/routines";

import styles from "../cards.module.scss";
import routineStyles from "./RoutinesCard.module.scss";

const formatRoutineWindow = (start: string, end: string) => `${start}-${end}`;

type RoutinesCardProps = {
  className?: string;
};

export const RoutinesCard: React.FC<RoutinesCardProps> = ({ className }) => {
  const todayProgress = useAppSelector(selectTodayRoutineProgress);
  const activeRoutineProgress = useAppSelector(selectActiveRoutineForNow);
  const upcomingRoutineProgress = useAppSelector(selectUpcomingRoutineForNow);
  const visibleRoutines = todayProgress.slice(0, 2);
  const completedCount = todayProgress.filter((item) => item.isComplete).length;
  const featuredProgress = activeRoutineProgress ?? upcomingRoutineProgress;
  const featuredRoutine = featuredProgress?.routine;

  return (
    <Card
      url="/routines"
      className={clsx(
        className,
        activeRoutineProgress && routineStyles.routineCardActive,
      )}
      icon={<ListChecks weight="duotone" />}
      title="Routines"
      color="--color-accent-amber"
    >
      <div className={styles.messageStack}>
        {featuredRoutine ? (
          <div
            className={clsx(
              routineStyles.routineCallout,
              activeRoutineProgress && routineStyles.routineCalloutActive,
            )}
          >
            <span className={routineStyles.routineStatus}>
              {activeRoutineProgress ? "Active now" : "Upcoming"}
            </span>
            <h3>{featuredRoutine.title}</h3>
            <p>
              {formatRoutineWindow(
                featuredRoutine.timeWindow.start,
                featuredRoutine.timeWindow.end,
              )}{" "}
              · {featuredRoutine.schedule}
            </p>
            {activeRoutineProgress ? (
              <Link className={routineStyles.routineActionLink} to="/routines">
                Open Routines
              </Link>
            ) : null}
          </div>
        ) : (
          <>
            <h3>
              {todayProgress.length > 0
                ? `${completedCount.toString()} of ${todayProgress.length.toString()} routines cleared today.`
                : "No active routine right now."}
            </h3>
            <p>Routines stay tucked away until you need them.</p>
          </>
        )}
        {visibleRoutines.length > 0 && !activeRoutineProgress ? (
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
        ) : null}
      </div>
    </Card>
  );
};
