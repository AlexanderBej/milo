import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type WheelEvent,
} from "react";
import { AnimatePresence } from "framer-motion";
import { PlusCircle } from "phosphor-react";

import { Button } from "@shared/components/Button";
import type { BoardNote as BoardNoteType } from "../types";
import { BoardNote } from "./BoardNote";
import styles from "./BoardCanvas.module.scss";

const CANVAS_WIDTH = 2400;
const CANVAS_HEIGHT = 1600;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.6;
const ZOOM_STEP = 0.1;

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
  startPanX: number;
  startPanY: number;
  startPointerX: number;
  startPointerY: number;
};

type ViewportSize = {
  width: number;
  height: number;
};

const clampZoom = (value: number) => {
  return Math.min(Math.max(value, MIN_ZOOM), MAX_ZOOM);
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
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [viewportSize, setViewportSize] = useState<ViewportSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;

      setViewportSize({ width, height });
    });

    resizeObserver.observe(viewport);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const clampPan = (
    nextPan: { x: number; y: number },
    zoomValue = zoom,
    size = viewportSize,
  ) => {
    if (size.width <= 0 || size.height <= 0) {
      return nextPan;
    }

    const scaledWidth = CANVAS_WIDTH * zoomValue;
    const scaledHeight = CANVAS_HEIGHT * zoomValue;
    const minX = size.width - scaledWidth;
    const minY = size.height - scaledHeight;

    return {
      x:
        scaledWidth <= size.width
          ? (size.width - scaledWidth) / 2
          : Math.min(Math.max(nextPan.x, minX), 0),
      y:
        scaledHeight <= size.height
          ? (size.height - scaledHeight) / 2
          : Math.min(Math.max(nextPan.y, minY), 0),
    };
  };

  const getViewportRect = () => {
    return viewportRef.current?.getBoundingClientRect() ?? null;
  };

  const getViewportCenter = () => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return { x: 520, y: 340 };
    }

    return {
      x: viewport.clientWidth / 2,
      y: viewport.clientHeight / 2,
    };
  };

  const zoomAroundPoint = (
    nextZoomValue: number,
    point: { x: number; y: number },
  ) => {
    const nextZoom = clampZoom(nextZoomValue);
    const canvasX = (point.x - pan.x) / zoom;
    const canvasY = (point.y - pan.y) / zoom;

    setZoom(nextZoom);
    setPan(
      clampPan(
        {
          x: point.x - canvasX * nextZoom,
          y: point.y - canvasY * nextZoom,
        },
        nextZoom,
      ),
    );
  };

  const getVisibleCenterPosition = () => {
    const center = getViewportCenter();

    return {
      x: Math.min(Math.max((center.x - pan.x) / zoom - 140, 24), 2088),
      y: Math.min(Math.max((center.y - pan.y) / zoom - 105, 24), 1368),
    };
  };

  const handleAddNote = () => {
    onAddNote(getVisibleCenterPosition());
  };

  const handleZoomIn = () => {
    zoomAroundPoint(zoom + ZOOM_STEP, getViewportCenter());
  };

  const handleZoomOut = () => {
    zoomAroundPoint(zoom - ZOOM_STEP, getViewportCenter());
  };

  const handleResetView = () => {
    setZoom(1);
    setPan(clampPan({ x: 0, y: 0 }, 1));
  };

  const handleFitToView = () => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const padding = 48;
    const fitZoom = clampZoom(
      Math.min(
        (viewport.clientWidth - padding) / CANVAS_WIDTH,
        (viewport.clientHeight - padding) / CANVAS_HEIGHT,
      ),
    );

    setZoom(fitZoom);
    setPan(
      clampPan(
        {
          x: (viewport.clientWidth - CANVAS_WIDTH * fitZoom) / 2,
          y: (viewport.clientHeight - CANVAS_HEIGHT * fitZoom) / 2,
        },
        fitZoom,
        { width: viewport.clientWidth, height: viewport.clientHeight },
      ),
    );
  };

  const shouldIgnoreCanvasGesture = (target: EventTarget | null) => {
    return (
      target instanceof Element &&
      (target.closest("[data-board-note='true']") ||
        target.closest("[data-board-canvas-static='true']"))
    );
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (shouldIgnoreCanvasGesture(event.target)) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    panState.current = {
      pointerId: event.pointerId,
      startPanX: pan.x,
      startPanY: pan.y,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
    };
    setIsPanning(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const currentPan = panState.current;

    if (!currentPan || currentPan.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    setPan(
      clampPan({
        x: currentPan.startPanX + event.clientX - currentPan.startPointerX,
        y: currentPan.startPanY + event.clientY - currentPan.startPointerY,
      }),
    );
  };

  const finishPan = (event: PointerEvent<HTMLDivElement>) => {
    const currentPan = panState.current;

    if (!currentPan || currentPan.pointerId !== event.pointerId) {
      return;
    }

    panState.current = null;
    setIsPanning(false);
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();

    const rect = getViewportRect();

    if (!rect) {
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      const direction = event.deltaY > 0 ? -1 : 1;

      zoomAroundPoint(zoom + direction * ZOOM_STEP, {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
      return;
    }

    setPan((currentPan) =>
      clampPan({
        x: currentPan.x - event.deltaX,
        y: currentPan.y - event.deltaY,
      }),
    );
  };

  const scaledWidth = CANVAS_WIDTH * zoom;
  const scaledHeight = CANVAS_HEIGHT * zoom;
  const canScrollX = viewportSize.width > 0 && scaledWidth > viewportSize.width;
  const canScrollY =
    viewportSize.height > 0 && scaledHeight > viewportSize.height;
  const horizontalThumbWidth = canScrollX
    ? Math.max((viewportSize.width / scaledWidth) * 100, 8)
    : 100;
  const verticalThumbHeight = canScrollY
    ? Math.max((viewportSize.height / scaledHeight) * 100, 8)
    : 100;
  const horizontalThumbLeft = canScrollX
    ? Math.min(
        Math.max((-pan.x / scaledWidth) * 100, 0),
        100 - horizontalThumbWidth,
      )
    : 0;
  const verticalThumbTop = canScrollY
    ? Math.min(
        Math.max((-pan.y / scaledHeight) * 100, 0),
        100 - verticalThumbHeight,
      )
    : 0;

  return (
    <section className={styles.boardShell} aria-label="Board canvas">
      <div className={styles.toolbar}>
        <div>
          <p className={styles.kicker}>Thinking space</p>
          <h2>Board</h2>
        </div>
        <div className={styles.toolbarActions}>
          <div
            aria-label="Board zoom controls"
            className={styles.zoomControls}
            data-board-canvas-static="true"
          >
            <button
              aria-label="Zoom out"
              disabled={zoom <= MIN_ZOOM}
              onClick={handleZoomOut}
              type="button"
            >
              -
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button
              aria-label="Zoom in"
              disabled={zoom >= MAX_ZOOM}
              onClick={handleZoomIn}
              type="button"
            >
              +
            </button>
            <button onClick={handleResetView} type="button">
              Reset
            </button>
            <button onClick={handleFitToView} type="button">
              Fit
            </button>
          </div>
          <Button icon={<PlusCircle weight="fill" />} onClick={handleAddNote}>
            Add note
          </Button>
        </div>
      </div>
      <div
        className={isPanning ? styles.viewportPanning : styles.viewport}
        onPointerCancel={finishPan}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPan}
        onWheel={handleWheel}
        ref={viewportRef}
      >
        {notes.length === 0 ? (
          <div className={styles.emptyMessage} data-board-canvas-static="true">
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
        <div
          className={styles.transformLayer}
          style={{
            transform: `translate(${pan.x.toFixed(2)}px, ${pan.y.toFixed(
              2,
            )}px) scale(${zoom.toFixed(2)})`,
          }}
        >
          <div className={styles.canvas}>
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
                  zoom={zoom}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div
          aria-hidden
          className={styles.horizontalScrollbar}
          data-board-canvas-static="true"
        >
          <span
            style={{
              left: `${horizontalThumbLeft.toFixed(2)}%`,
              width: `${horizontalThumbWidth.toFixed(2)}%`,
            }}
          />
        </div>
        <div
          aria-hidden
          className={styles.verticalScrollbar}
          data-board-canvas-static="true"
        >
          <span
            style={{
              height: `${verticalThumbHeight.toFixed(2)}%`,
              top: `${verticalThumbTop.toFixed(2)}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
};
