import { useEffect } from 'react';
import { useCanvasStore } from '../store/canvasStore.js';

// ============================================================
// Keyboard shortcuts
//   Ctrl/Cmd+Z  → Undo
//   Ctrl/Cmd+Y  → Redo
//   Ctrl/Cmd+Shift+Z → Redo
// ============================================================

export function useKeyboardShortcuts() {
  const { undo, redo } = useCanvasStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);
}
