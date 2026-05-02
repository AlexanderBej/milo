import { type SyntheticEvent, useEffect, useState } from "react";
import { CheckCircle, PlusCircle, X } from "phosphor-react";

import { useAppDispatch, useAppSelector } from "@app/hooks";
import { Button } from "@shared/components/Button";
import {
  addTask,
  clearTaskMessage,
  completeTask,
  deleteTask,
  selectCouldTasks,
  selectDoneTasks,
  selectMustTasks,
  selectShouldTasks,
  selectTaskMessage,
  undoCompleteTask,
  updateTaskPriority,
  type TaskPriority,
} from "@features/tasks";
import { TaskSection } from "../components";
import styles from "./DailyPlanPage.module.scss";

const priorityOptions: Array<{ label: string; value: TaskPriority }> = [
  { label: "Must", value: "must" },
  { label: "Should", value: "should" },
  { label: "Could", value: "could" },
];

export const DailyPlanPage = () => {
  const dispatch = useAppDispatch();
  const mustTasks = useAppSelector(selectMustTasks);
  const shouldTasks = useAppSelector(selectShouldTasks);
  const couldTasks = useAppSelector(selectCouldTasks);
  const doneTasks = useAppSelector(selectDoneTasks);
  const message = useAppSelector(selectTaskMessage);
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("should");

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(() => {
      dispatch(clearTaskMessage());
    }, 3600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [dispatch, message]);

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    dispatch(addTask({ content: trimmedContent, priority }));
    setContent("");
  };

  const handlePriorityChange = (taskId: string, taskPriority: TaskPriority) => {
    dispatch(updateTaskPriority({ id: taskId, priority: taskPriority }));
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
        {message ? (
          <div className={styles.message} role="status">
            <CheckCircle aria-hidden size={20} weight="fill" />
            <span>{message}</span>
            <button
              aria-label="Dismiss task message"
              onClick={() => {
                dispatch(clearTaskMessage());
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

      <section className={styles.grid} aria-label="Planning sections">
        <TaskSection
          emptyText="No must-do tasks yet."
          helper="Up to 3 things that make today a win."
          onComplete={(taskId) => {
            dispatch(completeTask(taskId));
          }}
          onDelete={(taskId) => {
            dispatch(deleteTask(taskId));
          }}
          onPriorityChange={handlePriorityChange}
          tasks={mustTasks}
          title="Must Do"
        />
        <TaskSection
          emptyText="No should-do tasks yet."
          helper="Helpful next steps if you have room."
          onComplete={(taskId) => {
            dispatch(completeTask(taskId));
          }}
          onDelete={(taskId) => {
            dispatch(deleteTask(taskId));
          }}
          onPriorityChange={handlePriorityChange}
          tasks={shouldTasks}
          title="Should Do"
        />
        <TaskSection
          emptyText="No could-do tasks yet."
          helper="Low-pressure extras."
          onComplete={(taskId) => {
            dispatch(completeTask(taskId));
          }}
          onDelete={(taskId) => {
            dispatch(deleteTask(taskId));
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
          onDelete={(taskId) => {
            dispatch(deleteTask(taskId));
          }}
          onPriorityChange={handlePriorityChange}
          onUndo={(taskId) => {
            dispatch(undoCompleteTask(taskId));
          }}
          tasks={doneTasks}
          title="Done"
        />
      </section>
    </main>
  );
};
