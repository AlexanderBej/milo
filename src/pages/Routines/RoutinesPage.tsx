import { type SyntheticEvent, useMemo, useState } from "react";
import {
  CheckCircle,
  Clock,
  ListChecks,
  PauseCircle,
  PencilSimple,
  PlusCircle,
  Trash,
} from "phosphor-react";

import { useAppDispatch, useAppSelector } from "@app/hooks";
import { Button } from "@shared/components/Button";
import {
  addRoutine,
  completeRoutineForPeriod,
  deactivateRoutine,
  selectRoutines,
  selectTodayRoutineProgress,
  toggleRoutineChecklistItemForPeriod,
  updateRoutine,
  type Routine,
  type RoutineSchedule,
} from "@features/routines";
import { useNow } from "@features/time";
import styles from "./RoutinesPage.module.scss";

const scheduleOptions: Array<{ label: string; value: RoutineSchedule }> = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
];

const defaultChecklist = ["Water", "Medication", "Get dressed"];

const toChecklistText = (items: string[]) => items.join("\n");

const parseChecklist = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const createEmptyForm = () => ({
  title: "",
  description: "",
  checklistText: toChecklistText(defaultChecklist),
  schedule: "daily" as RoutineSchedule,
  start: "08:00",
  end: "10:00",
  active: true,
});

type RoutineFormState = ReturnType<typeof createEmptyForm>;

export const RoutinesPage = () => {
  const dispatch = useAppDispatch();
  const routines = useAppSelector(selectRoutines);
  const routineProgress = useAppSelector(selectTodayRoutineProgress);
  const now = useNow();
  const [form, setForm] = useState<RoutineFormState>(createEmptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedRoutines = useMemo(
    () =>
      [...routines].sort((a, b) =>
        a.active === b.active
          ? a.timeWindow.start.localeCompare(b.timeWindow.start)
          : a.active
            ? -1
            : 1,
      ),
    [routines],
  );

  const editingRoutine = routines.find((routine) => routine.id === editingId);
  const formTitle = editingRoutine ? "Edit routine" : "Create routine";
  const progressByRoutineId = useMemo(
    () =>
      new Map(
        routineProgress.map((progress) => [progress.routine.id, progress]),
      ),
    [routineProgress],
  );

  const updateForm = <Key extends keyof RoutineFormState>(
    key: Key,
    value: RoutineFormState[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
  };

  const startEditing = (routine: Routine) => {
    setEditingId(routine.id);
    setForm({
      title: routine.title,
      description: routine.description ?? "",
      checklistText: toChecklistText(routine.checklist),
      schedule: routine.schedule,
      start: routine.timeWindow.start,
      end: routine.timeWindow.end,
      active: routine.active,
    });
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const checklist = parseChecklist(form.checklistText);
    const title = form.title.trim();

    if (!title || checklist.length === 0) {
      return;
    }

    const payload = {
      title,
      description: form.description,
      checklist,
      schedule: form.schedule,
      timeWindow: {
        start: form.start,
        end: form.end,
      },
      active: form.active,
    };

    if (editingId) {
      dispatch(updateRoutine({ id: editingId, changes: payload }));
    } else {
      dispatch(addRoutine(payload));
    }

    resetForm();
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Reusable rhythm</h1>
          <p>Keep repeatable habits visible without turning them into tasks.</p>
        </div>
      </header>

      <section className={styles.layout} aria-label="Routines workspace">
        <form className={styles.formPanel} onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <ListChecks aria-hidden size={24} weight="duotone" />
            <div>
              <h2>{formTitle}</h2>
              <p>One clear window, one gentle checklist.</p>
            </div>
          </div>

          <label className={styles.field}>
            <span>Title</span>
            <input
              onChange={(event) => {
                updateForm("title", event.target.value);
              }}
              placeholder="Morning routine"
              type="text"
              value={form.title}
            />
          </label>

          <label className={styles.field}>
            <span>Description</span>
            <textarea
              onChange={(event) => {
                updateForm("description", event.target.value);
              }}
              placeholder="Optional note for future-you"
              rows={3}
              value={form.description}
            />
          </label>

          <label className={styles.field}>
            <span>Checklist</span>
            <textarea
              onChange={(event) => {
                updateForm("checklistText", event.target.value);
              }}
              rows={5}
              value={form.checklistText}
            />
          </label>

          <div className={styles.scheduleGroup} aria-label="Schedule">
            {scheduleOptions.map((option) => (
              <button
                aria-pressed={form.schedule === option.value}
                className={
                  form.schedule === option.value
                    ? styles.segmentActive
                    : styles.segment
                }
                key={option.value}
                onClick={() => {
                  updateForm("schedule", option.value);
                }}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className={styles.timeGrid}>
            <label className={styles.field}>
              <span>Starts</span>
              <input
                onChange={(event) => {
                  updateForm("start", event.target.value);
                }}
                type="time"
                value={form.start}
              />
            </label>

            <label className={styles.field}>
              <span>Ends</span>
              <input
                onChange={(event) => {
                  updateForm("end", event.target.value);
                }}
                type="time"
                value={form.end}
              />
            </label>
          </div>

          <label className={styles.toggle}>
            <input
              checked={form.active}
              onChange={(event) => {
                updateForm("active", event.target.checked);
              }}
              type="checkbox"
            />
            <span>Active</span>
          </label>

          <div className={styles.formActions}>
            <Button icon={<PlusCircle weight="fill" />} type="submit">
              {editingRoutine ? "Save routine" : "Add routine"}
            </Button>
            {editingRoutine ? (
              <Button onClick={resetForm} type="button" variant="ghost">
                Cancel
              </Button>
            ) : null}
          </div>
        </form>

        <section className={styles.routineList} aria-label="Saved routines">
          {sortedRoutines.length > 0 ? (
            sortedRoutines.map((routine) => {
              const progress = progressByRoutineId.get(routine.id);
              const completedItems =
                progress?.completion?.completedChecklistItems ?? [];

              return (
                <article
                  className={
                    routine.active
                      ? styles.routineCard
                      : styles.routineCardMuted
                  }
                  key={routine.id}
                >
                  <div className={styles.routineHeader}>
                    <div>
                      <p className={styles.routineMeta}>
                        {routine.schedule} · {routine.timeWindow.start}-
                        {routine.timeWindow.end}
                      </p>
                      <h2>{routine.title}</h2>
                      {routine.description ? (
                        <p>{routine.description}</p>
                      ) : null}
                    </div>
                    {routine.active ? (
                      <span className={styles.activeBadge}>
                        <CheckCircle aria-hidden size={16} weight="fill" />
                        Active
                      </span>
                    ) : (
                      <span className={styles.pausedBadge}>
                        <PauseCircle aria-hidden size={16} />
                        Paused
                      </span>
                    )}
                  </div>

                  <ul className={styles.checklist}>
                    {routine.checklist.map((item) => {
                      const isChecked = completedItems.includes(item);

                      return (
                        <li key={item}>
                          <label>
                            <input
                              checked={isChecked}
                              disabled={!routine.active || !progress}
                              onChange={() => {
                                if (!progress) {
                                  return;
                                }

                                dispatch(
                                  toggleRoutineChecklistItemForPeriod({
                                    routineId: routine.id,
                                    periodKey: progress.periodKey,
                                    now: now.toISOString(),
                                    item,
                                  }),
                                );
                              }}
                              type="checkbox"
                            />
                            {item}
                          </label>
                        </li>
                      );
                    })}
                  </ul>

                  <div className={styles.cardActions}>
                    {progress ? (
                      <Button
                        disabled={progress.isComplete}
                        onClick={() => {
                          dispatch(
                            completeRoutineForPeriod({
                              routineId: routine.id,
                              periodKey: progress.periodKey,
                              now: now.toISOString(),
                            }),
                          );
                        }}
                        size="sm"
                        variant={progress.isComplete ? "ghost" : "secondary"}
                      >
                        {progress.isComplete ? "Complete" : "Complete now"}
                      </Button>
                    ) : null}
                    <Button
                      icon={<PencilSimple />}
                      onClick={() => {
                        startEditing(routine);
                      }}
                      size="sm"
                      variant="secondary"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => {
                        dispatch(
                          updateRoutine({
                            id: routine.id,
                            changes: { active: !routine.active },
                          }),
                        );
                      }}
                      size="sm"
                      variant="ghost"
                    >
                      {routine.active ? "Pause" : "Resume"}
                    </Button>
                    <Button
                      icon={<Trash />}
                      onClick={() => {
                        dispatch(deactivateRoutine(routine.id));
                      }}
                      size="sm"
                      variant="ghost"
                    >
                      Archive
                    </Button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <Clock aria-hidden size={28} weight="duotone" />
              <h2>No routines yet.</h2>
              <p>Add one repeatable rhythm to make tomorrow easier.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
};
