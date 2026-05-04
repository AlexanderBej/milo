import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { DotsSixVertical, Trash } from "phosphor-react";

import { DEFAULT_BOARD_AREA_COLOR, isBoardAreaColor } from "../constants";
import type { BoardArea as BoardAreaType } from "../types";
import styles from "./BoardArea.module.scss";

type BoardAreaProps = {
  area: BoardAreaType;
  onDelete: (areaId: string) => void;
  onMove: (areaId: string, x: number, y: number) => void;
  onMoveEnd: (areaId: string) => void;
  onResize: (areaId: string, width: number, height: number) => void;
  onResizeEnd: (areaId: string) => void;
  onRename: (areaId: string, title: string) => void;
  zoom: number;
};

type DragState = {
  pointerId: number;
  startPointerX: number;
  startPointerY: number;
  startX: number;
  startY: number;
};

type ResizeState = {
  pointerId: number;
  startPointerX: number;
  startPointerY: number;
  startWidth: number;
  startHeight: number;
};

const CANVAS_WIDTH = 2400;
const CANVAS_HEIGHT = 1600;
const MIN_WIDTH = 280;
const MIN_HEIGHT = 180;

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const BoardArea = ({
  area,
  onDelete,
  onMove,
  onMoveEnd,
  onResize,
  onResizeEnd,
  onRename,
  zoom,
}: BoardAreaProps) => {
  const dragState = useRef<DragState | null>(null);
  const resizeState = useRef<ResizeState | null>(null);
  const positionRef = useRef(area.position);
  const sizeRef = useRef(area.size);
  const [position, setPosition] = useState(area.position);
  const [size, setSize] = useState(area.size);
  const [draftTitle, setDraftTitle] = useState(area.title);
  const [isDragging, setIsDragging] = useState(false);
  const color =
    area.color && isBoardAreaColor(area.color)
      ? area.color
      : DEFAULT_BOARD_AREA_COLOR;

  useEffect(() => {
    if (!dragState.current) {
      positionRef.current = area.position;
      setPosition(area.position);
    }
  }, [area.position]);

  useEffect(() => {
    if (!resizeState.current) {
      sizeRef.current = area.size;
      setSize(area.size);
    }
  }, [area.size]);

  const commitTitle = () => {
    const nextTitle = draftTitle.trim() || "Untitled area";

    setDraftTitle(nextTitle);

    if (nextTitle !== area.title) {
      onRename(area.id, nextTitle);
    }
  };

  const startDrag = (event: PointerEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      pointerId: event.pointerId,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startX: area.position.x,
      startY: area.position.y,
    };
    setIsDragging(true);
  };

  const moveDrag = (event: PointerEvent<HTMLElement>) => {
    const currentDrag = dragState.current;

    if (!currentDrag || currentDrag.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const nextX = clamp(
      currentDrag.startX + (event.clientX - currentDrag.startPointerX) / zoom,
      0,
      CANVAS_WIDTH - sizeRef.current.width,
    );
    const nextY = clamp(
      currentDrag.startY + (event.clientY - currentDrag.startPointerY) / zoom,
      0,
      CANVAS_HEIGHT - sizeRef.current.height,
    );
    const nextPosition = { x: nextX, y: nextY };

    positionRef.current = nextPosition;
    setPosition(nextPosition);
    onMove(area.id, nextX, nextY);
  };

  const finishDrag = (event: PointerEvent<HTMLElement>) => {
    const currentDrag = dragState.current;

    if (!currentDrag || currentDrag.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    dragState.current = null;
    setIsDragging(false);
    onMove(area.id, positionRef.current.x, positionRef.current.y);
    onMoveEnd(area.id);
  };

  const startResize = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeState.current = {
      pointerId: event.pointerId,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startWidth: area.size.width,
      startHeight: area.size.height,
    };
  };

  const moveResize = (event: PointerEvent<HTMLButtonElement>) => {
    const currentResize = resizeState.current;

    if (!currentResize || currentResize.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const nextWidth = clamp(
      currentResize.startWidth +
        (event.clientX - currentResize.startPointerX) / zoom,
      MIN_WIDTH,
      CANVAS_WIDTH - positionRef.current.x,
    );
    const nextHeight = clamp(
      currentResize.startHeight +
        (event.clientY - currentResize.startPointerY) / zoom,
      MIN_HEIGHT,
      CANVAS_HEIGHT - positionRef.current.y,
    );
    const nextSize = { width: nextWidth, height: nextHeight };

    sizeRef.current = nextSize;
    setSize(nextSize);
    onResize(area.id, nextWidth, nextHeight);
  };

  const finishResize = (event: PointerEvent<HTMLButtonElement>) => {
    const currentResize = resizeState.current;

    if (!currentResize || currentResize.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    resizeState.current = null;
    onResize(area.id, sizeRef.current.width, sizeRef.current.height);
    onResizeEnd(area.id);
  };

  const handleTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }

    if (event.key === "Escape") {
      setDraftTitle(area.title);
      event.currentTarget.blur();
    }
  };

  return (
    <article
      className={[
        styles.area,
        styles[color],
        isDragging ? styles.areaDragging : "",
      ].join(" ")}
      data-board-area="true"
      style={{
        height: size.height,
        left: position.x,
        top: position.y,
        width: size.width,
      }}
    >
      <div
        className={styles.header}
        onPointerCancel={finishDrag}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={finishDrag}
      >
        <DotsSixVertical
          aria-hidden
          className={styles.dragIcon}
          size={20}
          weight="bold"
        />
        <input
          aria-label="Area title"
          className={styles.titleInput}
          onBlur={commitTitle}
          onChange={(event) => {
            setDraftTitle(event.target.value);
          }}
          onKeyDown={handleTitleKeyDown}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          value={draftTitle}
        />
        <button
          aria-label={`Delete ${area.title}`}
          className={styles.deleteButton}
          onClick={() => {
            onDelete(area.id);
          }}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          type="button"
        >
          <Trash aria-hidden size={16} weight="duotone" />
        </button>
      </div>
      <div
        aria-hidden
        className={styles.body}
        onPointerCancel={finishDrag}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={finishDrag}
      />
      <button
        aria-label={`Resize ${area.title}`}
        className={styles.resizeHandle}
        onPointerCancel={finishResize}
        onPointerDown={startResize}
        onPointerMove={moveResize}
        onPointerUp={finishResize}
        type="button"
      />
    </article>
  );
};
