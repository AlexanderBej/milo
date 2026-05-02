import { useEffect, useState } from "react";
import { CheckCircle } from "phosphor-react";

import { useAppDispatch, useAppSelector } from "@app/hooks";
import {
  addNote,
  deleteNote,
  moveNote,
  selectBoardNotes,
  updateNote,
  type BoardNote,
} from "@features/board";
import { BoardCanvas } from "@features/board/components";
import { addTask } from "@features/tasks";
import styles from "./BoardPage.module.scss";

const NOTE_OFFSET = 36;
const START_X = 260;
const START_Y = 220;

const getNextPosition = (noteCount: number) => {
  const offset = noteCount % 7;

  return {
    x: START_X + offset * NOTE_OFFSET,
    y: START_Y + offset * NOTE_OFFSET,
  };
};

export const BoardPage = () => {
  const dispatch = useAppDispatch();
  const notes = useAppSelector(selectBoardNotes);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  const handleAddNote = () => {
    dispatch(addNote(getNextPosition(notes.length)));
    setToast("Note added.");
  };

  const handleConvertToTask = (note: BoardNote) => {
    const content = note.content.trim();

    if (!content) {
      return;
    }

    dispatch(addTask({ content, priority: "could", source: "board" }));
    dispatch(deleteNote(note.id));
    setToast("Moved to today as a Could task.");
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Board</p>
          <h1>Let your thoughts spread out.</h1>
          <p>
            Sketch the shape of an idea, then turn the useful bits into tasks.
          </p>
        </div>
      </header>
      <BoardCanvas
        notes={notes}
        onAddNote={handleAddNote}
        onConvertToTask={handleConvertToTask}
        onDeleteNote={(noteId) => {
          dispatch(deleteNote(noteId));
          setToast("Note deleted.");
        }}
        onMoveNote={(noteId, x, y) => {
          dispatch(moveNote({ id: noteId, x, y }));
        }}
        onUpdateNote={(noteId, content) => {
          dispatch(updateNote({ id: noteId, content }));
        }}
      />
      {toast ? (
        <div className={styles.toast} role="status">
          <CheckCircle aria-hidden size={18} weight="fill" />
          <span>{toast}</span>
        </div>
      ) : null}
    </main>
  );
};
