import { type SyntheticEvent, useState } from "react";
import { PlusCircle } from "phosphor-react";

import { Button } from "@shared/components/Button";
import { OptionChipGroup } from "@shared/components/OptionChipGroup";
import type { TaskPriority, TaskTimeSlot } from "@features/tasks";
import type { PlanningChoice } from "@shared/utils/planning";
import styles from "../DailyPlanPage.module.scss";

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
  { label: "This month", value: "thisMonth" },
  { label: "This quarter", value: "thisQuarter" },
  { label: "Someday", value: "someday" },
];

const TASK_DESCRIPTION_MAX_LENGTH = 240;

export type TaskComposerDraft = {
  content: string;
  description?: string;
  planningChoice: PlanningChoice;
  priority: TaskPriority;
  timeSlot: TaskTimeSlot;
};

type AgendaTaskComposerProps = {
  onAddTask: (draft: TaskComposerDraft) => boolean;
};

export const AgendaTaskComposer = ({ onAddTask }: AgendaTaskComposerProps) => {
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("should");
  const [planningChoice, setPlanningChoice] = useState<PlanningChoice>("today");
  const [timeSlot, setTimeSlot] = useState<TaskTimeSlot>("anytime");

  const isComposerExpanded = content.length > 0;
  const canSubmitTask = content.trim().length > 0;

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    const didAddTask = onAddTask({
      content: trimmedContent,
      description: description.trim() || undefined,
      planningChoice,
      priority,
      timeSlot,
    });

    if (!didAddTask) {
      return;
    }

    setContent("");
    setDescription("");
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.compactRow}>
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

        <OptionChipGroup
          ariaLabel="New task priority"
          className={styles.priorityOptions}
          onChange={setPriority}
          options={priorityOptions}
          value={priority}
        />

        <Button
          disabled={!canSubmitTask}
          icon={<PlusCircle weight="fill" />}
          type="submit"
        >
          Add task
        </Button>
      </div>

      <div
        className={`${styles.expandedArea} ${
          isComposerExpanded ? styles.expandedAreaOpen : ""
        }`}
        aria-hidden={!isComposerExpanded}
      >
        <div className={styles.expandedContent}>
          <label className={styles.descriptionField}>
            <span className={styles.inputLabel}>Description</span>
            <textarea
              className={styles.textarea}
              maxLength={TASK_DESCRIPTION_MAX_LENGTH}
              onChange={(event) => {
                setDescription(event.target.value);
              }}
              placeholder="Add a note, context, or next step..."
              tabIndex={isComposerExpanded ? 0 : -1}
              value={description}
            />
            <span className={styles.characterCount}>
              {description.length}/{TASK_DESCRIPTION_MAX_LENGTH}
            </span>
          </label>

          <div className={styles.selectorGroup}>
            <OptionChipGroup
              ariaLabel="Time slot"
              className={styles.detailOptions}
              onChange={setTimeSlot}
              options={timeSlotOptions}
              tabIndex={isComposerExpanded ? 0 : -1}
              value={timeSlot}
            />

            <OptionChipGroup
              ariaLabel="When to plan this task"
              className={styles.detailOptions}
              onChange={setPlanningChoice}
              options={planningOptions}
              tabIndex={isComposerExpanded ? 0 : -1}
              value={planningChoice}
            />
          </div>
        </div>
      </div>
    </form>
  );
};
