import React from 'react';
import { useCanvasStore } from '../store/canvasStore.js';

// ============================================================
// App header with connection status and undo/redo
// ============================================================

const Header: React.FC = () => {
  const isConnected = useCanvasStore((s) => s.isConnected);
  const nodes = useCanvasStore((s) => s.nodes);
  const historyIndex = useCanvasStore((s) => s.historyIndex);
  const history = useCanvasStore((s) => s.history);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 h-14 border-b border-border-subtle bg-surface-1/80 backdrop-blur-xl shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="2.5" fill="#4F8EF7" />
            <circle cx="7" cy="2" r="1.5" fill="#4F8EF7" opacity="0.5" />
            <circle cx="7" cy="12" r="1.5" fill="#4F8EF7" opacity="0.5" />
            <circle cx="2" cy="7" r="1.5" fill="#4F8EF7" opacity="0.5" />
            <circle cx="12" cy="7" r="1.5" fill="#4F8EF7" opacity="0.5" />
          </svg>
        </div>
        <span className="font-display font-700 text-sm text-white/90 tracking-tight">
          Canvas<span className="text-accent-blue">AI</span>
        </span>
      </div>

      {/* Center: node count */}
      {nodes.length > 0 && (
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-body text-white/40">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-teal/70" />
          {nodes.length} node{nodes.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Right: controls */}
      <div className="flex items-center gap-3">
        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (⌘Z)"
            className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.78 3.78C5.26 2.3 7.4 1.5 9.5 2a6.5 6.5 0 1 1-6 8.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M1 5h5V0" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (⌘Y)"
            className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ transform: 'scaleX(-1)' }}>
              <path d="M3.78 3.78C5.26 2.3 7.4 1.5 9.5 2a6.5 6.5 0 1 1-6 8.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M1 5h5V0" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Connection indicator */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              isConnected ? 'bg-accent-teal animate-pulse-ring' : 'bg-red-500/60'
            }`}
          />
          <span className="text-xs font-body text-white/35">
            {isConnected ? 'live' : 'offline'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
