import fs from 'fs';
import path from 'path';
import { CanvasState } from '../types/index';

const STORAGE_FILE = path.join(process.cwd(), 'canvas-state.json');

let memoryState: CanvasState = { nodes: [], updatedAt: Date.now() };

// ============================================================
// Load persisted state from disk on startup
// ============================================================

export function loadState(): CanvasState {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
      memoryState = JSON.parse(raw) as CanvasState;
    }
  } catch {
    console.warn('[Persistence] Could not load state, using empty canvas');
  }
  return memoryState;
}

// ============================================================
// Get current in-memory state
// ============================================================

export function getState(): CanvasState {
  return memoryState;
}

// ============================================================
// Update state and persist to disk (debounced)
// ============================================================

let saveTimer: NodeJS.Timeout | null = null;

export function setState(state: CanvasState): void {
  memoryState = { ...state, updatedAt: Date.now() };

  // Debounce disk writes by 500ms to avoid thrashing on rapid drags
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(memoryState, null, 2));
    } catch {
      console.warn('[Persistence] Could not write state to disk');
    }
  }, 500);
}
