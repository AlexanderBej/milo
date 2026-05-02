import { useEffect, useRef, useState, type PointerEvent } from "react";
import { AnimatePresence } from "framer-motion";
import { PlusCircle } from "phosphor-react";

import { Button } from "@shared/components/Button";
import type { BoardNote as BoardNoteType } from "../types";
import { BoardNote } from "./BoardNote";
import styles from "./BoardCanvas.module.scss";

type BoardCanvasProps = {
  highlightedNoteId?: string | null;
  notes: BoardNoteType[];
  onAddNote: (position: { x: number; y: number }) => void;
  onConvertToTask: (note: BoardNoteType) => void;
  onDeleteNote: (noteId: string) => void;
  onDuplicateNote: (note: BoardNoteType) => void;
  onMoveNote: (noteId: string, x: number, y: number) => void;
  onUpdateNote: (noteId: string, content: string) => void;
};

type PanState = {
  pointerId: number;
  startPointerX: number;
  startPointerY: number;
  scrollLeft: number;
  scrollTop: number;
};

export const BoardCanvas = ({
  highlightedNoteId,
  notes,
  onAddNote,
  onConvertToTask,
  onDeleteNote,
  onDuplicateNote,
  onMoveNote,
  onUpdateNote,
}: BoardCanvasProps) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const panState = useRef<PanState | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    viewport.scrollTo({ left: 180, top: 120 });
  }, []);

  const getVisibleCenterPosition = () => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return { x: 260, y: 220 };
    }

    return {
      x: Math.min(
        Math.max(viewport.scrollLeft + viewport.clientWidth / 2 - 140, 24),
        2088,
      ),
      y: Math.min(
        Math.max(viewport.scrollTop + viewport.clientHeight / 2 - 105, 24),
        1368,
      ),
    };
  };

  const handleAddNote = () => {
    onAddNote(getVisibleCenterPosition());
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target;

    if (
      target instanceof Element &&
      (target.closest("[data-board-note='true']") ||
        target.closest("[data-board-canvas-static='true']"))
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    panState.current = {
      pointerId: event.pointerId,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      scrollLeft: event.currentTarget.scrollLeft,
      scrollTop: event.currentTarget.scrollTop,
    };
    setIsPanning(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const currentPan = panState.current;

    if (!currentPan || currentPan.pointerId !== event.pointerId) {
      return;
    }

    event.currentTarget.scrollLeft =
      currentPan.scrollLeft - (event.clientX - currentPan.startPointerX);
    event.currentTarget.scrollTop =
      currentPan.scrollTop - (event.clientY - currentPan.startPointerY);
  };

  const finishPan = (event: PointerEvent<HTMLDivElement>) => {
    const currentPan = panState.current;

    if (!currentPan || currentPan.pointerId !== event.pointerId) {
      return;
    }

    panState.current = null;
    setIsPanning(false);
  };

  return (
    <section className={styles.boardShell} aria-label="Board canvas">
      <div className={styles.toolbar}>
        <div>
          <p className={styles.kicker}>Thinking space</p>
          <h2>Board</h2>
        </div>
        <Button icon={<PlusCircle weight="fill" />} onClick={handleAddNote}>
          Add note
        </Button>
      </div>
      <div
        className={isPanning ? styles.viewportPanning : styles.viewport}
        onPointerCancel={finishPan}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPan}
        ref={viewportRef}
      >
        <div className={styles.canvas}>
          {notes.length === 0 ? (
            <div
              className={styles.emptyMessage}
              data-board-canvas-static="true"
            >
              <h3>Drop a thought here.</h3>
              <p>Use the board when an idea is too messy for a task list.</p>
              <Button
                icon={<PlusCircle weight="fill" />}
                onClick={handleAddNote}
                size="sm"
              >
                Add note
              </Button>
            </div>
          ) : null}
          <AnimatePresence>
            {notes.map((note) => (
              <BoardNote
                key={note.id}
                isHighlighted={highlightedNoteId === note.id}
                note={note}
                onConvertToTask={onConvertToTask}
                onDelete={onDeleteNote}
                onDuplicate={onDuplicateNote}
                onMove={onMoveNote}
                onUpdate={onUpdateNote}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
