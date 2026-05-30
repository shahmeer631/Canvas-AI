import { useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getSocket } from '../services/socket.js';
import { useCanvasStore } from '../store/canvasStore.js';
import { CanvasNode } from '../types/index.js';

// ============================================================
// Hook: manages socket lifecycle and event bindings
// ============================================================

export function useSocket() {
  const { setNodes, updateNodePosition, setStatus, setError, setConnected, pushHistory } =
    useCanvasStore();

  // Track pending request IDs to avoid stale responses
  const pendingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const socket = getSocket();

    // ── Connection events ────────────────────────────────────
    const onConnect = () => {
      console.log('[Socket] Connected:', socket.id);
      setConnected(true);
    };
    const onDisconnect = (reason: string) => {
      console.log('[Socket] Disconnected:', reason);
      setConnected(false);
    };

    // ── canvas:loaded — restore persisted state ──────────────
    const onCanvasLoaded = ({ nodes }: { nodes: CanvasNode[] }) => {
      setNodes(nodes);
      pushHistory(nodes);
      setStatus('success');
    };

    // ── canvas:generated — new AI layout received ────────────
    const onCanvasGenerated = ({
      nodes,
      requestId,
    }: {
      nodes: CanvasNode[];
      requestId: string;
    }) => {
      // Always sync canvas for every connected tab
      setNodes(nodes);
      pushHistory(nodes);

      // Only clear loading/error for the tab that initiated this request
      if (pendingRef.current.has(requestId)) {
        pendingRef.current.delete(requestId);
        setStatus('success');
        setError(null);
      }
    };

    // ── canvas:error ─────────────────────────────────────────
    const onCanvasError = ({
      message,
      requestId,
    }: {
      message: string;
      requestId: string;
    }) => {
      if (!pendingRef.current.has(requestId)) return;
      pendingRef.current.delete(requestId);
      setStatus('error');
      setError(message);
    };

    // ── node:moved — remote user dragged a node ──────────────
    const onNodeMoved = ({ id, x, y }: { id: string; x: number; y: number }) => {
      updateNodePosition(id, x, y);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('canvas:loaded', onCanvasLoaded);
    socket.on('canvas:generated', onCanvasGenerated);
    socket.on('canvas:error', onCanvasError);
    socket.on('node:moved', onNodeMoved);

    // Sync initial connection state
    setConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('canvas:loaded', onCanvasLoaded);
      socket.off('canvas:generated', onCanvasGenerated);
      socket.off('canvas:error', onCanvasError);
      socket.off('node:moved', onNodeMoved);
    };
  }, [setNodes, updateNodePosition, setStatus, setError, setConnected, pushHistory]);

  // ── Generate canvas from prompt ──────────────────────────
  const generate = (prompt: string) => {
    const socket = getSocket();
    const requestId = uuidv4();
    pendingRef.current.add(requestId);
    setStatus('loading');
    setError(null);
    socket.emit('canvas:generate', { prompt, requestId });
    return requestId;
  };

  // ── Emit node drag ────────────────────────────────────────
  const moveNode = (id: string, x: number, y: number) => {
    const socket = getSocket();
    socket.emit('node:move', { id, x, y });
  };

  return { generate, moveNode };
}
