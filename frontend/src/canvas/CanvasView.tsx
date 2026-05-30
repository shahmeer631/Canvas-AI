import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Line } from 'react-konva';
import Konva from 'konva';
import { useCanvasStore } from '../store/canvasStore.js';
import { CircleNode, RectNode } from './CanvasNodes.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants.js';

interface CanvasProps {
  onDragMove: (id: string, x: number, y: number) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}

// ============================================================
// Main Konva canvas — renders all nodes with zoom/pan
// ============================================================

const SCROLL_STEP = 48;
const MIN_SCALE = 0.3;
const MAX_SCALE = 3;

const CanvasView: React.FC<CanvasProps> = ({ onDragMove, onDragEnd }) => {
  const nodes = useCanvasStore((s) => s.nodes);
  const stageRef = useRef<Konva.Stage>(null);
  const [scale, setScale] = useState(1);

  const panStage = useCallback((dx: number, dy: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.position({ x: stage.x() + dx, y: stage.y() + dy });
  }, []);

  const scrollUp = useCallback(() => panStage(0, SCROLL_STEP), [panStage]);
  const scrollDown = useCallback(() => panStage(0, -SCROLL_STEP), [panStage]);

  const zoomAtPointer = useCallback((deltaY: number) => {
    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.06;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clamped = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
    setScale(clamped);

    stage.scale({ x: clamped, y: clamped });
    stage.position({
      x: pointer.x - mousePointTo.x * clamped,
      y: pointer.y - mousePointTo.y * clamped,
    });
  }, []);

  // ── Wheel: scroll vertically · Ctrl/Cmd + wheel: zoom ───────
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      if (e.evt.ctrlKey || e.evt.metaKey) {
        zoomAtPointer(e.evt.deltaY);
      } else {
        panStage(0, -e.evt.deltaY);
      }
    },
    [panStage, zoomAtPointer]
  );

  // ── Arrow keys: scroll up / down ───────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollUp();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollDown();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [scrollUp, scrollDown]);

  // ── Grid lines ─────────────────────────────────────────────
  const gridSpacing = 40;
  const gridLines: React.ReactNode[] = [];
  for (let i = 0; i <= CANVAS_WIDTH / gridSpacing; i++) {
    gridLines.push(
      <Line
        key={`v-${i}`}
        points={[i * gridSpacing, 0, i * gridSpacing, CANVAS_HEIGHT]}
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={1}
        listening={false}
      />
    );
  }
  for (let j = 0; j <= CANVAS_HEIGHT / gridSpacing; j++) {
    gridLines.push(
      <Line
        key={`h-${j}`}
        points={[0, j * gridSpacing, CANVAS_WIDTH, j * gridSpacing]}
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={1}
        listening={false}
      />
    );
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-border-muted relative">
      {/* Scale indicator */}
      <div className="absolute top-3 right-3 z-10 text-xs font-mono text-white/30 bg-surface-2 px-2 py-1 rounded-lg border border-border-subtle">
        {Math.round(scale * 100)}%
      </div>

      {/* Scroll up / down */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1">
        <button
          type="button"
          onClick={scrollUp}
          title="Scroll up (↑)"
          aria-label="Scroll canvas up"
          className="p-2 rounded-lg bg-surface-2 border border-border-subtle text-white/40 hover:text-white/80 hover:bg-white/5 transition"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 3L3 9h10L8 3z" fill="currentColor" />
          </svg>
        </button>
        <button
          type="button"
          onClick={scrollDown}
          title="Scroll down (↓)"
          aria-label="Scroll canvas down"
          className="p-2 rounded-lg bg-surface-2 border border-border-subtle text-white/40 hover:text-white/80 hover:bg-white/5 transition"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 13L3 7h10l-5 6z" fill="currentColor" />
          </svg>
        </button>
      </div>

      <Stage
        ref={stageRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onWheel={handleWheel}
        draggable
        style={{ cursor: 'grab' }}
      >
        {/* Background */}
        <Layer listening={false}>
          <Rect
            x={0}
            y={0}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            fill="#0E1017"
          />
          {gridLines}
        </Layer>

        {/* Nodes */}
        <Layer>
          {nodes.map((node) =>
            node.type === 'circle' ? (
              <CircleNode
                key={node.id}
                node={node}
                onDragMove={onDragMove}
                onDragEnd={onDragEnd}
              />
            ) : (
              <RectNode
                key={node.id}
                node={node}
                onDragMove={onDragMove}
                onDragEnd={onDragEnd}
              />
            )
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasView;
