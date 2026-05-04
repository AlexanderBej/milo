import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { motion } from "framer-motion";
import {
  Check,
  CheckCircle,
  CheckSquare,
  Copy,
  DotsSixVertical,
  PencilSimple,
  Trash,
  X,
} from "phosphor-react";

import type { BoardNote as BoardNoteType } from "../types";
import styles from "./BoardNote.module.scss";

type BoardNoteProps = {
  isHighlighted?: boolean;
  note: BoardNoteType;
  onConvertToTask: (note: BoardNoteType) => void;
  onDelete: (noteId: string) => void;
  onDuplicate: (note: BoardNoteType) => void;
  onMove: (noteId: string, x: number, y: number) => void;
  onMoveEnd: (noteId: string) => void;
  onUpdate: (noteId: string, content: string) => void;
  zoom: number;
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
  isHighlighted = false,
  note,
  onConvertToTask,
  onDelete,
  onDuplicate,
  onMove,
  onMoveEnd,
  onUpdate,
  zoom,
}: BoardNoteProps) => {
  const dragState = useRef<DragState | null>(null);
  const positionRef = useRef({ x: note.x, y: note.y });
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [position, setPosition] = useState({ x: note.x, y: note.y });
  const [draft, setDraft] = useState(note.content);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [feedback, setFeedback] = useState<
    "saved" | "task" | "duplicated" | null
  >(null);
  const canUseContent = note.content.trim().length > 0;
  const canSave = draft.trim().length > 0;

  useEffect(() => {
    if (!dragState.current) {
      const nextPosition = { x: note.x, y: note.y };

      positionRef.current = nextPosition;
      setPosition(nextPosition);
    }
  }, [note.x, note.y]);

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timer = window.setTimeout(() => {
      setFeedback(null);
    }, 1800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [feedback]);

  useEffect(() => {
    if (!isDeleteConfirming) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsDeleteConfirming(false);
    }, 2600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isDeleteConfirming]);

  const startEditing = () => {
    if (isDragging) {
      return;
    }

    setDraft(note.content);
    setIsDeleteConfirming(false);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!canSave) {
      return;
    }

    onUpdate(note.id, draft.trim());
    setIsEditing(false);
    setFeedback("saved");
  };

  const cancelEdit = () => {
    setDraft(note.content);
    setIsEditing(false);
  };

  const handleHeaderPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (isEditing) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      pointerId: event.pointerId,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startX: note.x,
      startY: note.y,
    };
    setIsDragging(true);
    setIsDeleteConfirming(false);
  };

  const handleHeaderPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const currentDrag = dragState.current;

    if (!currentDrag || currentDrag.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const nextX = clampPosition(
      currentDrag.startX + (event.clientX - currentDrag.startPointerX) / zoom,
      2088,
    );
    const nextY = clampPosition(
      currentDrag.startY + (event.clientY - currentDrag.startPointerY) / zoom,
      1368,
    );
    const nextPosition = { x: nextX, y: nextY };

    positionRef.current = nextPosition;
    setPosition(nextPosition);
    onMove(note.id, nextX, nextY);
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    const currentDrag = dragState.current;

    if (!currentDrag || currentDrag.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    dragState.current = null;
    setIsDragging(false);
    onMove(note.id, positionRef.current.x, positionRef.current.y);
    onMoveEnd(note.id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      saveEdit();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
    }
  };

  const handleDragHandleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const movementByKey: Partial<Record<string, { x: number; y: number }>> = {
      ArrowDown: { x: 0, y: 24 },
      ArrowLeft: { x: -24, y: 0 },
      ArrowRight: { x: 24, y: 0 },
      ArrowUp: { x: 0, y: -24 },
    };
    const movement = movementByKey[event.key];

    if (!movement) {
      return;
    }

    event.preventDefault();

    const nextX = clampPosition(note.x + movement.x, 2088);
    const nextY = clampPosition(note.y + movement.y, 1368);

    positionRef.current = { x: nextX, y: nextY };
    setPosition(positionRef.current);
    onMove(note.id, nextX, nextY);
    onMoveEnd(note.id);
  };

  return (
    <motion.article
      animate={{
        opacity: 1,
        scale: isDragging ? 1.015 : 1,
        y: isDragging ? -2 : 0,
      }}
      className={[
        styles.note,
        isDragging ? styles.noteDragging : "",
        isHighlighted ? styles.noteHighlighted : "",
      ].join(" ")}
      data-board-note="true"
      exit={{ opacity: 0, scale: 0.98 }}
      initial={{ opacity: 0, scale: 0.98 }}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      style={{ left: position.x, top: position.y }}
      transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
    >
      <div
        aria-label="Drag note"
        className={styles.header}
        onPointerCancel={finishDrag}
        onPointerDown={handleHeaderPointerDown}
        onPointerMove={handleHeaderPointerMove}
        onPointerUp={finishDrag}
        onKeyDown={handleDragHandleKeyDown}
        role="button"
        tabIndex={0}
      >
        <DotsSixVertical aria-hidden size={22} weight="bold" />
        <span>{isEditing ? "Editing" : "Drag"}</span>
      </div>

      {isEditing ? (
        <div
          className={styles.editor}
          onDoubleClick={(event) => {
            event.stopPropagation();
          }}
        >
          <textarea
            aria-label="Edit board note"
            className={styles.textarea}
            onChange={(event) => {
              setDraft(event.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Write a thought..."
            ref={textareaRef}
            value={draft}
          />
          <div className={styles.editActions}>
            <button
              className={styles.actionButton}
              disabled={!canSave}
              onClick={saveEdit}
              type="button"
            >
              <Check aria-hidden size={16} weight="bold" />
              <span>Save</span>
            </button>
            <button
              className={styles.actionButton}
              onClick={cancelEdit}
              type="button"
            >
              <X aria-hidden size={16} weight="bold" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          className={styles.body}
          onClick={startEditing}
          onDoubleClick={startEditing}
          type="button"
        >
          {canUseContent ? (
            note.content
          ) : (
            <span className={styles.placeholder}>Write a thought...</span>
          )}
        </button>
      )}

      {!isEditing ? (
        <div
          className={styles.actions}
          onDoubleClick={(event) => {
            event.stopPropagation();
          }}
        >
          <button
            className={styles.actionButton}
            onClick={startEditing}
            type="button"
          >
            <PencilSimple aria-hidden size={16} weight="duotone" />
            <span>Edit</span>
          </button>
          <button
            className={styles.actionButton}
            disabled={!canUseContent}
            onClick={() => {
              onConvertToTask(note);
              setFeedback("task");
            }}
            type="button"
          >
            <CheckSquare aria-hidden size={16} weight="duotone" />
            <span>Task</span>
          </button>
          <button
            className={styles.iconButton}
            onClick={() => {
              onDuplicate(note);
              setFeedback("duplicated");
            }}
            type="button"
          >
            <Copy aria-hidden size={16} weight="duotone" />
            <span>Duplicate</span>
          </button>
          <button
            className={
              isDeleteConfirming
                ? styles.deleteButtonConfirm
                : styles.deleteButton
            }
            onClick={() => {
              if (isDeleteConfirming) {
                onDelete(note.id);
                return;
              }

              setIsDeleteConfirming(true);
            }}
            type="button"
          >
            <Trash aria-hidden size={16} weight="duotone" />
            <span>{isDeleteConfirming ? "Confirm delete" : "Delete"}</span>
          </button>
        </div>
      ) : null}

      {feedback ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className={styles.feedback}
          initial={{ opacity: 0, y: 4 }}
          role="status"
        >
          <CheckCircle aria-hidden size={16} weight="fill" />
          <span>
            {feedback === "saved"
              ? "Saved"
              : feedback === "task"
                ? "Task created"
                : "Duplicated"}
          </span>
        </motion.div>
      ) : null}
    </motion.article>
  );
};
