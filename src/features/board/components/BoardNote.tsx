import { useEffect, useRef, useState, type PointerEvent } from "react";
import { motion } from "framer-motion";
import { CheckSquare, Trash } from "phosphor-react";

import type { BoardNote as BoardNoteType } from "../types";
import styles from "./BoardNote.module.scss";

type BoardNoteProps = {
  note: BoardNoteType;
  onConvertToTask: (note: BoardNoteType) => void;
  onDelete: (noteId: string) => void;
  onMove: (noteId: string, x: number, y: number) => void;
  onUpdate: (noteId: string, content: string) => void;
};

type DragState = {
  pointerId: number;
  startPointerX: number;
  startPointerY: number;
  startX: number;
  startY: number;
};

const clampPosition = (value: number, max: number) => {
  return Math.min(Math.max(value, 24), max);
};

export const BoardNote = ({
  note,
  onConvertToTask,
  onDelete,
  onMove,
  onUpdate,
}: BoardNoteProps) => {
  const dragState = useRef<DragState | null>(null);
  const positionRef = useRef({ x: note.x, y: note.y });
  const [position, setPosition] = useState({ x: note.x, y: note.y });
  const canConvert = note.content.trim().length > 0;

  useEffect(() => {
    if (!dragState.current) {
      const nextPosition = { x: note.x, y: note.y };

      positionRef.current = nextPosition;
      setPosition(nextPosition);
    }
  }, [note.x, note.y]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target;

    if (
      target instanceof Element &&
      target.closest("[data-board-note-static='true']")
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      pointerId: event.pointerId,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startX: note.x,
      startY: note.y,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const currentDrag = dragState.current;

    if (!currentDrag || currentDrag.pointerId !== event.pointerId) {
      return;
    }

    const nextX = clampPosition(
      currentDrag.startX + event.clientX - currentDrag.startPointerX,
      2160,
    );
    const nextY = clampPosition(
      currentDrag.startY + event.clientY - currentDrag.startPointerY,
      1400,
    );

    const nextPosition = { x: nextX, y: nextY };

    positionRef.current = nextPosition;
    setPosition(nextPosition);
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    const currentDrag = dragState.current;

    if (!currentDrag || currentDrag.pointerId !== event.pointerId) {
      return;
    }

    dragState.current = null;
    onMove(note.id, positionRef.current.x, positionRef.current.y);
  };

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className={styles.note}
      data-board-note="true"
      exit={{ opacity: 0, scale: 0.98 }}
      initial={{ opacity: 0, scale: 0.98 }}
      onPointerCancel={finishDrag}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      style={{ left: position.x, top: position.y }}
      transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
    >
      <div className={styles.dragHandle} aria-hidden />
      <textarea
        aria-label="Board note"
        className={styles.textarea}
        data-board-note-static="true"
        onChange={(event) => {
          onUpdate(note.id, event.target.value);
        }}
        placeholder="Empty thought..."
        value={note.content}
      />
      <div className={styles.actions} data-board-note-static="true">
        <button
          className={styles.convertButton}
          disabled={!canConvert}
          onClick={() => {
            onConvertToTask(note);
          }}
          type="button"
        >
          <CheckSquare aria-hidden size={16} weight="duotone" />
          <span>Convert to Task</span>
        </button>
        <button
          aria-label="Delete board note"
          className={styles.iconButton}
          onClick={() => {
            onDelete(note.id);
          }}
          type="button"
        >
          <Trash aria-hidden size={16} weight="duotone" />
        </button>
      </div>
    </motion.div>
  );
};
