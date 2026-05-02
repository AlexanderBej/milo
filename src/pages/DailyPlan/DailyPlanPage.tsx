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
  selectCouldTasks,
  selectDoneTasks,
  selectMustTasks,
  selectShouldTasks,
  selectTasks,
  selectTaskMessage,
  undoCompleteTask,
  updateTaskPriority,
  type TaskPriority,
} from "@features/tasks";
import { selectMustDoLimit } from "@features/preferences";
import { TaskSection } from "../../features/tasks/components";
import styles from "./DailyPlanPage.module.scss";

const priorityOptions: Array<{ label: string; value: TaskPriority }> = [
  { label: "Must", value: "must" },
  { label: "Should", value: "should" },
  { label: "Could", value: "could" },
];

type PlanToast = {
  message: string;
  undo?: () => void;
};

export const DailyPlanPage = () => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectTasks);
  const mustTasks = useAppSelector(selectMustTasks);
  const shouldTasks = useAppSelector(selectShouldTasks);
  const couldTasks = useAppSelector(selectCouldTasks);
  const doneTasks = useAppSelector(selectDoneTasks);
  const message = useAppSelector(selectTaskMessage);
  const mustDoLimit = useAppSelector(selectMustDoLimit);
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("should");
  const [toast, setToast] = useState<PlanToast | null>(null);
  const todoCount = mustTasks.length + shouldTasks.length + couldTasks.length;
  const hasTasks = tasks.length > 0;
  const allTasksDone = hasTasks && todoCount === 0;

  useEffect(() => {
    if (!message && !toast) {
      return;
    }

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

    if (!trimmedContent) {
      return;
    }

    const canAddTask = priority !== "must" || mustTasks.length < mustDoLimit;

    dispatch(
      addTask({
        content: trimmedContent,
        maxMustDoLimit: mustDoLimit,
        priority,
      }),
    );
    setContent("");

    if (canAddTask) {
      setToast({ message: "Task added to today." });
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

    if (!snapshot) {
      return;
    }

    setToast({
      message: "Removed. Undo?",
      undo: () => {
        dispatch(restoreTask(snapshot));
        setToast({ message: "Task restored." });
      },
    });
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Plan</p>
          <h1>Daily Plan</h1>
          <p>Choose what matters today. Keep it doable.</p>
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
                onClick={() => {
                  toast.undo?.();
                }}
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
            placeholder="Add something to today’s plan..."
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
          <h2>You’re done for today. Nice work.</h2>
        </section>
      ) : null}

      <section className={styles.grid} aria-label="Planning sections">
        <TaskSection
          emptyText="No Must tasks waiting."
          helper={`Up to ${mustDoLimit} things that make today a win.`}
          onComplete={handleComplete}
          onDelete={handleDelete}
          onMove={(taskId, direction) => {
            dispatch(moveTask({ id: taskId, direction }));
          }}
          onPriorityChange={handlePriorityChange}
          tasks={mustTasks}
          title="Must Do"
        />
        <TaskSection
          emptyText="No Should tasks waiting."
          helper="Helpful next steps if you have room."
          onComplete={handleComplete}
          onDelete={handleDelete}
          onMove={(taskId, direction) => {
            dispatch(moveTask({ id: taskId, direction }));
          }}
          onPriorityChange={handlePriorityChange}
          tasks={shouldTasks}
          title="Should Do"
        />
        <TaskSection
          emptyText="No Could tasks waiting."
          helper="Low-pressure extras."
          onComplete={handleComplete}
          onDelete={handleDelete}
          onMove={(taskId, direction) => {
            dispatch(moveTask({ id: taskId, direction }));
          }}
          onPriorityChange={handlePriorityChange}
          tasks={couldTasks}
          title="Could Do"
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
          tasks={doneTasks}
          title="Done"
        />
      </section>
    </main>
  );
};
