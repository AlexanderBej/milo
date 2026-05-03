import { type SyntheticEvent, useEffect, useState } from "react";
import { CheckCircle, PlusCircle, X } from "phosphor-react";

import { useAppDispatch, useAppSelector } from "@app/hooks";
import { Button } from "@shared/components/Button";
import {
  addTask,
  clearTaskMessage,
  completeTask,
  deleteTask,
  moveTask,
  restoreTask,
  selectActiveLaterTasks,
  selectActiveSomedayTasks,
  selectActiveSoonTasks,
  selectActiveTodayTasks,
  selectDoneTasks,
  selectTasks,
  selectTaskMessage,
  undoCompleteTask,
  updateTaskPriority,
  type TaskPriority,
  type TaskTimeSlot,
  updateTask,
} from "@features/tasks";
import { selectMustDoLimit } from "@features/preferences";
import { useNow } from "@features/time";
import {
  completeRoutineForPeriod,
  selectTodayRoutineProgress,
  toggleRoutineChecklistItemForPeriod,
} from "@features/routines";
import { TaskSection } from "../../features/tasks/components";
import {
  getTodayDateString,
  getTomorrowDateString,
  type PlanningChoice,
} from "@shared/utils/planning";
import styles from "./DailyPlanPage.module.scss";

const priorityOptions: Array<{ label: string; value: TaskPriority }> = [
  { label: "Must", value: "must" },
  { label: "Should", value: "should" },
  { label: "Could", value: "could" },
];

const timeSlotOptions: Array<{ label: string; value: TaskTimeSlot }> = [
  { label: "Anytime", value: "anytime" },
  { label: "Morning", value: "morning" },
  { label: "Afternoon", value: "afternoon" },
  { label: "Evening", value: "evening" },
];

const planningOptions: Array<{ label: string; value: PlanningChoice }> = [
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "This week", value: "thisWeek" },
  { label: "Next week", value: "nextWeek" },
  { label: "Next month", value: "nextMonth" },
  { label: "Next quarter", value: "nextQuarter" },
  { label: "Someday", value: "someday" },
];

type PlanToast = {
  message: string;
  undo?: () => void;
};

const resolvePlanningChoice = (choice: PlanningChoice) => {
  if (choice === "today") {
    return {
      dueDate: getTodayDateString(),
      planningBucket: "today" as const,
    };
  }

  if (choice === "tomorrow") {
    return {
      dueDate: getTomorrowDateString(),
      planningBucket: "soon" as const,
    };
  }

  if (choice === "thisWeek") {
    return {
      dueDate: undefined,
      planningBucket: "soon" as const,
    };
  }

  if (
    choice === "nextWeek" ||
    choice === "nextMonth" ||
    choice === "nextQuarter"
  ) {
    return {
      dueDate: undefined,
      planningBucket: "later" as const,
    };
  }

  return {
    dueDate: undefined,
    planningBucket: "someday" as const,
  };
};

export const DailyPlanPage = () => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectTasks);
  const todayTasks = useAppSelector(selectActiveTodayTasks);
  const soonTasks = useAppSelector(selectActiveSoonTasks);
  const laterTasks = useAppSelector(selectActiveLaterTasks);
  const somedayTasks = useAppSelector(selectActiveSomedayTasks);
  const doneTasks = useAppSelector(selectDoneTasks);
  const message = useAppSelector(selectTaskMessage);
  const mustDoLimit = useAppSelector(selectMustDoLimit);

  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("should");
  const [planningChoice, setPlanningChoice] = useState<PlanningChoice>("today");
  const [timeSlot, setTimeSlot] = useState<TaskTimeSlot>("anytime");
  const [toast, setToast] = useState<PlanToast | null>(null);

  const activeTaskCount =
    todayTasks.length +
    soonTasks.length +
    laterTasks.length +
    somedayTasks.length;

  const mustTasks = todayTasks.filter((task) => task.priority === "must");
  const hasTasks = tasks.length > 0;
  const allTasksDone = hasTasks && activeTaskCount === 0;

  useEffect(() => {
    if (!message && !toast) return;

    const timer = window.setTimeout(() => {
      dispatch(clearTaskMessage());
      setToast(null);
    }, 6000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [dispatch, message, toast]);

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent) return;

    const planning = resolvePlanningChoice(planningChoice);
    const canAddTask = priority !== "must" || mustTasks.length < mustDoLimit;

    dispatch(
      addTask({
        content: trimmedContent,
        maxMustDoLimit: mustDoLimit,
        priority,
        timeSlot,
        ...planning,
      }),
    );

    setContent("");

    if (canAddTask) {
      setToast({ message: "Task added to plan." });
    }
  };

  const handlePriorityChange = (taskId: string, taskPriority: TaskPriority) => {
    dispatch(
      updateTaskPriority({
        id: taskId,
        maxMustDoLimit: mustDoLimit,
        priority: taskPriority,
      }),
    );
  };

  const findTaskSnapshot = (taskId: string) => {
    const index = tasks.findIndex((task) => task.id === taskId);
    const task = tasks.find((item) => item.id === taskId);

    return task ? { index, task } : null;
  };

  const handleComplete = (taskId: string) => {
    dispatch(completeTask(taskId));
    setToast({
      message: "Nice. That task is done.",
      undo: () => {
        dispatch(undoCompleteTask(taskId));
        setToast({ message: "Task restored." });
      },
    });
  };

  const handleDelete = (taskId: string) => {
    const snapshot = findTaskSnapshot(taskId);

    dispatch(deleteTask(taskId));

    if (!snapshot) return;

    setToast({
      message: "Removed. Undo?",
      undo: () => {
        dispatch(restoreTask(snapshot));
        setToast({ message: "Task restored." });
      },
    });
  };

  const handlePlanningChange = (
    taskId: string,
    planningBucket: "today" | "soon" | "later" | "someday",
  ) => {
    dispatch(
      updateTask({
        id: taskId,
        changes: {
          planningBucket,
          dueDate:
            planningBucket === "today" ? getTodayDateString() : undefined,
        },
      }),
    );
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Plan</p>
          <h1>Agenda</h1>
          <p>Plan today, park later, and keep life out of your head.</p>
        </div>
      </header>

      <section className={styles.inputPanel} aria-label="Add task">
        {message || toast ? (
          <div className={styles.message} role="status">
            <CheckCircle aria-hidden size={20} weight="fill" />
            <span>{message ?? toast?.message}</span>
            {toast?.undo ? (
              <button
                className={styles.undoButton}
                onClick={() => toast.undo?.()}
                type="button"
              >
                Undo
              </button>
            ) : null}
            <button
              aria-label="Dismiss task message"
              onClick={() => {
                dispatch(clearTaskMessage());
                setToast(null);
              }}
              type="button"
            >
              <X aria-hidden size={18} weight="bold" />
            </button>
          </div>
        ) : null}

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.inputLabel} htmlFor="task-content">
            Task
          </label>
          <input
            className={styles.input}
            id="task-content"
            onChange={(event) => {
              setContent(event.target.value);
            }}
            placeholder="Add something to your plan..."
            type="text"
            value={content}
          />

          <div className={styles.priorityGroup} aria-label="New task priority">
            {priorityOptions.map((option) => (
              <button
                aria-pressed={priority === option.value}
                className={
                  priority === option.value
                    ? styles.priorityChoiceActive
                    : styles.priorityChoice
                }
                key={option.value}
                onClick={() => {
                  setPriority(option.value);
                }}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>

          <select
            className={styles.select}
            value={planningChoice}
            onChange={(event) => {
              setPlanningChoice(event.target.value as PlanningChoice);
            }}
            aria-label="When to plan this task"
          >
            {planningOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            value={timeSlot}
            onChange={(event) => {
              setTimeSlot(event.target.value as TaskTimeSlot);
            }}
            aria-label="Time slot"
          >
            {timeSlotOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Button icon={<PlusCircle weight="fill" />} type="submit">
            Add task
          </Button>
        </form>
      </section>

      {!hasTasks ? (
        <section className={styles.emptyPanel} aria-live="polite">
          <h2>Your plan is clear. Add something small when you’re ready.</h2>
        </section>
      ) : allTasksDone ? (
        <section className={styles.emptyPanel} aria-live="polite">
          <h2>You’re done for now. Nice work.</h2>
        </section>
      ) : null}

      <TodayRoutinesSection />

      <section className={styles.grid} aria-label="Planning sections">
        <TaskSection
          emptyText="Nothing planned for today."
          helper={`Today’s focus. Keep Must tasks around ${mustDoLimit.toString()}.`}
          onComplete={handleComplete}
          onDelete={handleDelete}
          onMove={(taskId, direction) => {
            dispatch(moveTask({ id: taskId, direction }));
          }}
          onPlanningChange={handlePlanningChange}
          onPriorityChange={handlePriorityChange}
          tasks={todayTasks}
          title="Today"
        />

        <TaskSection
          emptyText="Nothing coming soon."
          helper="Tomorrow and this week."
          onComplete={handleComplete}
          onDelete={handleDelete}
          onMove={(taskId, direction) => {
            dispatch(moveTask({ id: taskId, direction }));
          }}
          onPlanningChange={handlePlanningChange}
          onPriorityChange={handlePriorityChange}
          tasks={soonTasks}
          title="Soon"
        />

        <TaskSection
          emptyText="Nothing parked for later."
          helper="Next week, next month, or next quarter."
          onComplete={handleComplete}
          onDelete={handleDelete}
          onMove={(taskId, direction) => {
            dispatch(moveTask({ id: taskId, direction }));
          }}
          onPlanningChange={handlePlanningChange}
          onPriorityChange={handlePriorityChange}
          tasks={laterTasks}
          title="Later"
        />

        <TaskSection
          emptyText="No someday tasks."
          helper="Ideas without pressure."
          onComplete={handleComplete}
          onDelete={handleDelete}
          onMove={(taskId, direction) => {
            dispatch(moveTask({ id: taskId, direction }));
          }}
          onPlanningChange={handlePlanningChange}
          onPriorityChange={handlePriorityChange}
          tasks={somedayTasks}
          title="Someday"
        />
      </section>

      <section className={styles.doneSection} aria-label="Completed tasks">
        <TaskSection
          emptyText="Nothing completed yet."
          helper="Finished work, kept lightly out of the way."
          onComplete={() => undefined}
          onDelete={handleDelete}
          onPriorityChange={handlePriorityChange}
          onUndo={(taskId) => {
            dispatch(undoCompleteTask(taskId));
            setToast({ message: "Task restored." });
          }}
          onPlanningChange={handlePlanningChange}
          tasks={doneTasks}
          title="Done"
        />
      </section>
    </main>
  );
};

const TodayRoutinesSection = () => {
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
