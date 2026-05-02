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

export const BoardPage = () => {
  const dispatch = useAppDispatch();
  const notes = useAppSelector(selectBoardNotes);
  const [highlightedNoteId, setHighlightedNoteId] = useState<string | null>(
    null,
  );
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

  useEffect(() => {
    if (!highlightedNoteId) {
      return;
    }

    const timer = window.setTimeout(() => {
      setHighlightedNoteId(null);
    }, 1200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [highlightedNoteId]);

  const handleAddNote = (position: { x: number; y: number }) => {
    const action = addNote({ ...position });

    dispatch(action);
    setHighlightedNoteId(action.payload.id);
    setToast("Note added.");
  };

  const handleConvertToTask = (note: BoardNote) => {
    const content = note.content.trim();

    if (!content) {
      return;
    }

    dispatch(addTask({ content, priority: "could", source: "board" }));
    setToast("Task created from note.");
  };

  const handleDuplicateNote = (note: BoardNote) => {
    const action = addNote({
      content: note.content,
      x: Math.min(note.x + 36, 2088),
      y: Math.min(note.y + 36, 1368),
    });

    dispatch(action);
    setHighlightedNoteId(action.payload.id);
    setToast("Note duplicated.");
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
        highlightedNoteId={highlightedNoteId}
        notes={notes}
        onAddNote={handleAddNote}
        onConvertToTask={handleConvertToTask}
        onDeleteNote={(noteId) => {
          dispatch(deleteNote(noteId));
          setToast("Note deleted.");
        }}
        onDuplicateNote={handleDuplicateNote}
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
