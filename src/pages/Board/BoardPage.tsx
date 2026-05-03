import { useEffect, useState } from "react";
import { CheckCircle } from "phosphor-react";

import { useAppDispatch, useAppSelector } from "@app/hooks";
import {
  addNote,
  deleteNote,
  moveNote,
  restoreNote,
  selectBoardNotes,
  updateNote,
  type BoardNote,
} from "@features/board";
import { BoardCanvas } from "@features/board/components";
import { addTask } from "@features/tasks";
import { selectMustDoLimit } from "@features/preferences";
import { getTodayDateString } from "@shared/utils/planning";
import styles from "./BoardPage.module.scss";

type BoardToast = {
  message: string;
  undo?: () => void;
};

export const BoardPage = () => {
  const dispatch = useAppDispatch();
  const notes = useAppSelector(selectBoardNotes);
  const mustDoLimit = useAppSelector(selectMustDoLimit);
  const [highlightedNoteId, setHighlightedNoteId] = useState<string | null>(
    null,
  );
  const [toast, setToast] = useState<BoardToast | null>(null);

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
    setToast({ message: "Note added." });
  };

  const handleConvertToTask = (note: BoardNote) => {
    const content = note.content.trim();

    if (!content) {
      return;
    }

    dispatch(
      addTask({
        content,
        maxMustDoLimit: mustDoLimit,
        priority: "could",
        source: "board",
        planningBucket: "today",
        dueDate: getTodayDateString(),
        timeSlot: "anytime",
      }),
    );
    setToast({ message: "Task added to Agenda." });
  };

  const handleDuplicateNote = (note: BoardNote) => {
    const action = addNote({
      content: note.content,
      x: Math.min(note.x + 36, 2088),
      y: Math.min(note.y + 36, 1368),
    });

    dispatch(action);
    setHighlightedNoteId(action.payload.id);
    setToast({ message: "Note duplicated." });
  };

  const handleDeleteNote = (noteId: string) => {
    const index = notes.findIndex((note) => note.id === noteId);
    const note = notes.find((item) => item.id === noteId);

    dispatch(deleteNote(noteId));

    if (!note) {
      setToast({ message: "Note deleted." });
      return;
    }

    setToast({
      message: "Note deleted. Undo?",
      undo: () => {
        dispatch(restoreNote({ note, index }));
        setToast({ message: "Note restored." });
      },
    });
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
        onDeleteNote={handleDeleteNote}
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
          <span>{toast.message}</span>
          {toast.undo ? (
            <button
              onClick={() => {
                toast.undo?.();
              }}
              type="button"
            >
              Undo
            </button>
          ) : null}
        </div>
      ) : null}
    </main>
  );
};
