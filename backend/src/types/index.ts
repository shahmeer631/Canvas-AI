// ============================================================
// Core domain types
// ============================================================

export type ShapeType = 'circle' | 'rectangle';

export interface CanvasNode {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  radius: number;
  width: number;
  height: number;
  fill: string;
  label: string;
}

export interface CanvasState {
  nodes: CanvasNode[];
  updatedAt: number;
}

// ============================================================
// AI types
// ============================================================

export interface AIGenerateRequest {
  prompt: string;
}

export interface AIGenerateResponse {
  nodes: CanvasNode[];
}

export interface RawAINode {
  id?: unknown;
  type?: unknown;
  x?: unknown;
  y?: unknown;
  radius?: unknown;
  width?: unknown;
  height?: unknown;
  fill?: unknown;
  label?: unknown;
}

// ============================================================
// Socket event payload types
// ============================================================

export interface CanvasGeneratePayload {
  prompt: string;
  requestId: string;
}

export interface CanvasGeneratedPayload {
  nodes: CanvasNode[];
  requestId: string;
}

export interface CanvasErrorPayload {
  message: string;
  requestId: string;
}

export interface NodeMovePayload {
  id: string;
  x: number;
  y: number;
}

export interface NodeMovedPayload {
  id: string;
  x: number;
  y: number;
  socketId: string;
}

// ============================================================
// Validation
// ============================================================

export interface ValidationResult {
  valid: boolean;
  nodes: CanvasNode[];
  errors: string[];
}
