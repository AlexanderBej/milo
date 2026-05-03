import { Button } from "@shared/components/Button";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { useNow } from "@features/time";
import {
  completeRoutineForPeriod,
  selectTodayRoutineProgress,
  toggleRoutineChecklistItemForPeriod,
} from "@features/routines";
import styles from "../DailyPlanPage.module.scss";

export const TodayRoutinesSection = () => {
  const dispatch = useAppDispatch();
  const routineProgress = useAppSelector(selectTodayRoutineProgress);
  const now = useNow();

  if (routineProgress.length === 0) {
    return null;
  }

  return (
    <section className={styles.routinesPanel} aria-label="Today routines">
      <div className={styles.routinesHeader}>
        <div>
          <p className={styles.eyebrow}>Today routines</p>
          <h2>Repeatable rhythms</h2>
        </div>
      </div>

      <div className={styles.routineGrid}>
        {routineProgress.map(
          ({
            completedCount,
            completion,
            isComplete,
            periodKey,
            routine,
            totalCount,
          }) => (
            <article className={styles.routineCard} key={routine.id}>
              <div className={styles.routineCardHeader}>
                <div>
                  <h3>{routine.title}</h3>
                  <p>
                    {routine.timeWindow.start}-{routine.timeWindow.end} ·{" "}
                    {completedCount}/{totalCount}
                  </p>
                </div>
                {isComplete ? (
                  <span className={styles.routineDoneBadge}>Done</span>
                ) : null}
              </div>

              <ul className={styles.routineChecklist}>
                {routine.checklist.map((item) => {
                  const isChecked =
                    completion?.completedChecklistItems.includes(item) ?? false;

                  return (
                    <li key={item}>
                      <label>
                        <input
                          checked={isChecked}
                          onChange={() => {
                            dispatch(
                              toggleRoutineChecklistItemForPeriod({
                                routineId: routine.id,
                                periodKey,
                                now: now.toISOString(),
                                item,
                              }),
                            );
                          }}
                          type="checkbox"
                        />
                        <span>{item}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>

              <Button
                disabled={isComplete}
                onClick={() => {
                  dispatch(
                    completeRoutineForPeriod({
                      routineId: routine.id,
                      periodKey,
                      now: now.toISOString(),
                    }),
                  );
                }}
                size="sm"
                variant={isComplete ? "ghost" : "secondary"}
              >
                {isComplete ? "Routine complete" : "Complete routine"}
              </Button>
            </article>
          ),
        )}
      </div>
    </section>
  );
};
