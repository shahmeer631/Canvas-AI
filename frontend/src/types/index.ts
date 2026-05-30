// ============================================================
// Core domain types (mirror backend)
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

// ============================================================
// Socket event types
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

export interface CanvasLoadedPayload {
  nodes: CanvasNode[];
}

// ============================================================
// Socket event map (for typed emit/on)
// ============================================================

export interface ServerToClientEvents {
  'canvas:generated': (payload: CanvasGeneratedPayload) => void;
  'canvas:loaded': (payload: CanvasLoadedPayload) => void;
  'canvas:error': (payload: CanvasErrorPayload) => void;
  'node:moved': (payload: NodeMovedPayload) => void;
}

export interface ClientToServerEvents {
  'canvas:generate': (payload: CanvasGeneratePayload) => void;
  'node:move': (payload: NodeMovePayload) => void;
}

// ============================================================
// Store types
// ============================================================

export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface HistoryEntry {
  nodes: CanvasNode[];
  timestamp: number;
}

export interface CanvasStore {
  // State
  nodes: CanvasNode[];
  status: GenerationStatus;
  errorMessage: string | null;
  isConnected: boolean;
  history: HistoryEntry[];
  historyIndex: number;

  // Actions
  setNodes: (nodes: CanvasNode[]) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  setStatus: (status: GenerationStatus) => void;
  setError: (msg: string | null) => void;
  setConnected: (v: boolean) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: (nodes: CanvasNode[]) => void;
}
