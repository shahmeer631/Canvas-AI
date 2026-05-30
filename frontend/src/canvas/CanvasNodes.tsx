import React, { useCallback, useRef, useState } from 'react';
import { Circle, Rect, Group, Text } from 'react-konva';
import Konva from 'konva';
import { CanvasNode } from '../types/index.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants.js';

// ============================================================
// Shared props
// ============================================================

interface NodeProps {
  node: CanvasNode;
  onDragMove: (id: string, x: number, y: number) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}

// ============================================================
// Clamp helpers — keep shapes fully inside canvas
// ============================================================

function clampCircle(x: number, y: number, radius: number) {
  return {
    x: Math.min(Math.max(x, radius), CANVAS_WIDTH - radius),
    y: Math.min(Math.max(y, radius), CANVAS_HEIGHT - radius),
  };
}

function clampRect(x: number, y: number, w: number, h: number) {
  return {
    x: Math.min(Math.max(x, 0), CANVAS_WIDTH - w),
    y: Math.min(Math.max(y, 0), CANVAS_HEIGHT - h),
  };
}

// ============================================================
// CircleNode
// ============================================================

export const CircleNode: React.FC<NodeProps> = ({ node, onDragMove, onDragEnd }) => {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<Konva.Group>(null);

  const handleDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const clamped = clampCircle(e.target.x(), e.target.y(), node.radius);
      e.target.position(clamped);
      onDragMove(node.id, clamped.x, clamped.y);
    },
    [node.id, node.radius, onDragMove]
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const clamped = clampCircle(e.target.x(), e.target.y(), node.radius);
      onDragEnd(node.id, clamped.x, clamped.y);
    },
    [node.id, node.radius, onDragEnd]
  );

  const scale = hovered ? 1.08 : 1;

  return (
    <Group
      ref={groupRef}
      x={node.x}
      y={node.y}
      draggable
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      scaleX={scale}
      scaleY={scale}
    >
      {/* Outer glow ring */}
      <Circle
        radius={node.radius + 6}
        fill="transparent"
        stroke={node.fill}
        strokeWidth={hovered ? 2 : 1}
        opacity={hovered ? 0.5 : 0.2}
      />
      {/* Main circle */}
      <Circle
        radius={node.radius}
        fill={node.fill}
        shadowColor={node.fill}
        shadowBlur={hovered ? 20 : 12}
        shadowOpacity={hovered ? 0.7 : 0.45}
        strokeWidth={1.5}
        stroke="rgba(255,255,255,0.25)"
      />
      {/* Label */}
      {node.label && (
        <Text
          text={node.label}
          fontSize={node.radius * 0.7}
          fontFamily='"Syne", sans-serif'
          fontStyle="600"
          fill="rgba(255,255,255,0.95)"
          align="center"
          verticalAlign="middle"
          offsetX={node.radius * 0.35}
          offsetY={node.radius * 0.28}
          listening={false}
        />
      )}
    </Group>
  );
};

// ============================================================
// RectNode
// ============================================================

export const RectNode: React.FC<NodeProps> = ({ node, onDragMove, onDragEnd }) => {
  const [hovered, setHovered] = useState(false);

  const handleDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const clamped = clampRect(e.target.x(), e.target.y(), node.width, node.height);
      e.target.position(clamped);
      onDragMove(node.id, clamped.x, clamped.y);
    },
    [node.id, node.width, node.height, onDragMove]
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const clamped = clampRect(e.target.x(), e.target.y(), node.width, node.height);
      onDragEnd(node.id, clamped.x, clamped.y);
    },
    [node.id, node.width, node.height, onDragEnd]
  );

  return (
    <Group
      x={node.x}
      y={node.y}
      draggable
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Glow outline */}
      <Rect
        width={node.width + 8}
        height={node.height + 8}
        x={-4}
        y={-4}
        cornerRadius={14}
        fill="transparent"
        stroke={node.fill}
        strokeWidth={hovered ? 2 : 1}
        opacity={hovered ? 0.45 : 0.18}
      />
      {/* Main rect */}
      <Rect
        width={node.width}
        height={node.height}
        cornerRadius={10}
        fill={node.fill}
        shadowColor={node.fill}
        shadowBlur={hovered ? 22 : 14}
        shadowOpacity={hovered ? 0.65 : 0.4}
        strokeWidth={1.5}
        stroke="rgba(255,255,255,0.22)"
      />
      {/* Label */}
      {node.label && (
        <Text
          text={node.label}
          fontSize={Math.min(node.width, node.height) * 0.42}
          fontFamily='"Syne", sans-serif'
          fontStyle="600"
          fill="rgba(255,255,255,0.95)"
          width={node.width}
          height={node.height}
          align="center"
          verticalAlign="middle"
          listening={false}
        />
      )}
    </Group>
  );
};
