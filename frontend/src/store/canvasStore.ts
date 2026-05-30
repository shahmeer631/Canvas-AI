import { create } from 'zustand';
import { CanvasNode, CanvasStore, GenerationStatus, HistoryEntry } from '../types/index.js';

const MAX_HISTORY = 30;

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────
  nodes: [],
  status: 'idle',
  errorMessage: null,
  isConnected: false,
  history: [],
  historyIndex: -1,

  // ── Set all nodes (replaces state) ────────────────────────
  setNodes: (nodes: CanvasNode[]) => {
    set({ nodes });
  },

  // ── Update a single node's position ───────────────────────
  updateNodePosition: (id: string, x: number, y: number) => {
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
    }));
  },

  // ── Status & error ─────────────────────────────────────────
  setStatus: (status: GenerationStatus) => set({ status }),
  setError: (errorMessage: string | null) => set({ errorMessage }),
  setConnected: (isConnected: boolean) => set({ isConnected }),

  // ── History management ─────────────────────────────────────
  pushHistory: (nodes: CanvasNode[]) => {
    const { history, historyIndex } = get();
    // Truncate forward history on new action
    const trimmed = history.slice(0, historyIndex + 1);
    const entry: HistoryEntry = { nodes: JSON.parse(JSON.stringify(nodes)), timestamp: Date.now() };
    const newHistory = [...trimmed, entry].slice(-MAX_HISTORY);
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    set({ historyIndex: newIndex, nodes: JSON.parse(JSON.stringify(history[newIndex].nodes)) });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    set({ historyIndex: newIndex, nodes: JSON.parse(JSON.stringify(history[newIndex].nodes)) });
  },
}));
