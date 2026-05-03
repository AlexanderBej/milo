import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@app/hooks";
import {
  addTask,
  clearTaskMessage,
  completeTask,
  deleteTask,
  restoreTask,
  selectActiveLaterTasks,
  selectActiveSomedayTasks,
  selectActiveSoonTasks,
  selectActiveTodayTasks,
  selectDoneTasks,
  selectTasks,
  selectTaskMessage,
  undoCompleteTask,
  updateTask,
  updateTaskPriority,
  type Task,
  type TaskPriority,
} from "@features/tasks";
import { selectMustDoLimit } from "@features/preferences";
import {
  getTodayDateString,
  getTomorrowDateString,
  type PlanningChoice,
} from "@shared/utils/planning";
import {
  AgendaTaskComposer,
  type TaskComposerDraft,
} from "./components/AgendaTaskComposer";
import {
  AgendaTaskMessage,
  type PlanToast,
} from "./components/AgendaTaskMessage";
import { AgendaTaskSections } from "./components/AgendaTaskSections";
import { TodayRoutinesSection } from "./components/TodayRoutinesSection";
import styles from "./DailyPlanPage.module.scss";

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

  if (choice === "thisMonth" || choice === "thisQuarter") {
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

  const handleAddTask = (draft: TaskComposerDraft) => {
    const planning = resolvePlanningChoice(draft.planningChoice);
    const canAddTask =
      draft.priority !== "must" || mustTasks.length < mustDoLimit;

    dispatch(
      addTask({
        content: draft.content,
        description: draft.description,
        maxMustDoLimit: mustDoLimit,
        priority: draft.priority,
        timeSlot: draft.timeSlot,
        ...planning,
      }),
    );

    if (canAddTask) {
      setToast({ message: "Task added to plan." });
    }

    return canAddTask;
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
    planningBucket: NonNullable<Task["planningBucket"]>,
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

  const handleDismissMessage = () => {
    dispatch(clearTaskMessage());
    setToast(null);
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
        <AgendaTaskMessage
          message={message}
          onDismiss={handleDismissMessage}
          toast={toast}
        />
        <AgendaTaskComposer onAddTask={handleAddTask} />
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

      <AgendaTaskSections
        doneTasks={doneTasks}
        laterTasks={laterTasks}
        mustDoLimit={mustDoLimit}
        onComplete={handleComplete}
        onDelete={handleDelete}
        onPlanningChange={handlePlanningChange}
        onPriorityChange={handlePriorityChange}
        onUndo={(taskId) => {
          dispatch(undoCompleteTask(taskId));
          setToast({ message: "Task restored." });
        }}
        somedayTasks={somedayTasks}
        soonTasks={soonTasks}
        todayTasks={todayTasks}
      />
    </main>
  );
};
