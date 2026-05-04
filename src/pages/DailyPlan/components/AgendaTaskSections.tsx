import { TaskSection } from "@features/tasks/components";
import type { Task, TaskPriority } from "@features/tasks";
import styles from "../DailyPlanPage.module.scss";

type AgendaTaskSectionsProps = {
  doneTasks: Task[];
  laterTasks: Task[];
  mustDoLimit: number;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onPlanningChange: (
    taskId: string,
    planningBucket: NonNullable<Task["planningBucket"]>,
  ) => void;
  onPriorityChange: (taskId: string, taskPriority: TaskPriority) => void;
  onUndo: (taskId: string) => void;
  somedayTasks: Task[];
  soonTasks: Task[];
  todayKey: string;
  todayTasks: Task[];
};

export const AgendaTaskSections = ({
  doneTasks,
  laterTasks,
  mustDoLimit,
  onComplete,
  onDelete,
  onPlanningChange,
  onPriorityChange,
  onUndo,
  somedayTasks,
  soonTasks,
  todayKey,
  todayTasks,
}: AgendaTaskSectionsProps) => {
  return (
    <>
      <section className={styles.grid} aria-label="Planning sections">
        <TaskSection
          emptyText="Nothing planned for today."
          helper={`Today’s focus. Keep Must tasks around ${mustDoLimit.toString()}.`}
          onComplete={onComplete}
          onDelete={onDelete}
          onPlanningChange={onPlanningChange}
          onPriorityChange={onPriorityChange}
          tasks={todayTasks}
          todayKey={todayKey}
          title="Today"
        />

        <TaskSection
          emptyText="Nothing coming soon."
          helper="Tomorrow and this week."
          onComplete={onComplete}
          onDelete={onDelete}
          onPlanningChange={onPlanningChange}
          onPriorityChange={onPriorityChange}
          tasks={soonTasks}
          todayKey={todayKey}
          title="Soon"
        />

        <TaskSection
          emptyText="Nothing parked for later."
          helper="This month or this quarter."
          onComplete={onComplete}
          onDelete={onDelete}
          onPlanningChange={onPlanningChange}
          onPriorityChange={onPriorityChange}
          tasks={laterTasks}
          todayKey={todayKey}
          title="Later"
        />

        <TaskSection
          emptyText="No someday tasks."
          helper="Ideas without pressure."
          onComplete={onComplete}
          onDelete={onDelete}
          onPlanningChange={onPlanningChange}
          onPriorityChange={onPriorityChange}
          tasks={somedayTasks}
          todayKey={todayKey}
          title="Someday"
        />
      </section>

      <section className={styles.doneSection} aria-label="Completed tasks">
        <TaskSection
          emptyText="Nothing completed yet."
          helper="Finished work, kept lightly out of the way."
          onComplete={() => undefined}
          onDelete={onDelete}
          onPlanningChange={onPlanningChange}
          onPriorityChange={onPriorityChange}
          onUndo={onUndo}
          tasks={doneTasks}
          todayKey={todayKey}
          title="Done"
        />
      </section>
    </>
  );
};
