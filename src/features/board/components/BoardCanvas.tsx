import { useEffect, useRef, useState, type PointerEvent } from "react";
import { AnimatePresence } from "framer-motion";
import { PlusCircle } from "phosphor-react";

import { Button } from "@shared/components/Button";
import type { BoardNote as BoardNoteType } from "../types";
import { BoardNote } from "./BoardNote";
import styles from "./BoardCanvas.module.scss";

type BoardCanvasProps = {
  notes: BoardNoteType[];
  onAddNote: () => void;
  onConvertToTask: (note: BoardNoteType) => void;
  onDeleteNote: (noteId: string) => void;
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
  notes,
  onAddNote,
  onConvertToTask,
  onDeleteNote,
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

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target;

    if (
      target instanceof Element &&
      target.closest("[data-board-note='true']")
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
        <Button icon={<PlusCircle weight="fill" />} onClick={onAddNote}>
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
            <div className={styles.emptyMessage}>
              Drop a thought here. You can organize it later.
            </div>
          ) : null}
          <AnimatePresence>
            {notes.map((note) => (
              <BoardNote
                key={note.id}
                note={note}
                onConvertToTask={onConvertToTask}
                onDelete={onDeleteNote}
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
