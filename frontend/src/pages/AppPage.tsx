import React, { useCallback } from 'react';
import Header from '../components/Header.js';
import PromptBar from '../components/PromptBar.js';
import CanvasView from '../canvas/CanvasView.js';
import EmptyState from '../components/EmptyState.js';
import LoadingOverlay from '../components/LoadingOverlay.js';
import PageScrollButtons from '../components/PageScrollButtons.js';
import { useSocket } from '../hooks/useSocket.js';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts.js';
import { useCanvasStore } from '../store/canvasStore.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants.js';

// ============================================================
// App root page
// ============================================================

const AppPage: React.FC = () => {
  const { generate, moveNode } = useSocket();
  useKeyboardShortcuts();

  const nodes = useCanvasStore((s) => s.nodes);
  const status = useCanvasStore((s) => s.status);
  const updateNodePosition = useCanvasStore((s) => s.updateNodePosition);

  const isEmpty = nodes.length === 0;
  const isLoading = status === 'loading';

  // Drag move: update local state optimistically
  const handleDragMove = useCallback(
    (id: string, x: number, y: number) => {
      updateNodePosition(id, x, y);
      // Throttle: socket emit handled in handleDragEnd
    },
    [updateNodePosition]
  );

  // Drag end: emit to server for sync
  const handleDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      updateNodePosition(id, x, y);
      moveNode(id, x, y);
    },
    [updateNodePosition, moveNode]
  );

  return (
    <div className="flex flex-col min-h-screen bg-surface-0 text-white">
      <Header />

      <main className="flex flex-col items-center p-6 pt-5 gap-5 pb-24">
        <div
          className="relative w-full max-w-[1000px] shrink-0"
          style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`, maxHeight: '58vh' }}
        >
          {/* We render the Stage at full size then scale with CSS */}
          <div
            className="absolute inset-0 origin-top-left"
            style={{
              transform: `scale(var(--canvas-scale, 1))`,
            }}
          >
            <CanvasView onDragMove={handleDragMove} onDragEnd={handleDragEnd} />
          </div>

          {/* Overlays */}
          {isEmpty && !isLoading && <EmptyState />}
          {isLoading && <LoadingOverlay />}
        </div>

        {/* Prompt bar */}
        <div className="w-full max-w-3xl animate-fade-in">
          <PromptBar onGenerate={generate} />
        </div>
      </main>

      <PageScrollButtons />
    </div>
  );
};

export default AppPage;
