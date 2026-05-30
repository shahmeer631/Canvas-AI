import { Server, Socket } from 'socket.io';
import { generateCanvasNodes } from '../ai/generator';
import { getState, setState } from '../services/persistence';
import { validateNodeMove } from '../services/validation';
import {
  CanvasGeneratePayload,
  CanvasGeneratedPayload,
  CanvasErrorPayload,
  NodeMovePayload,
  NodeMovedPayload,
} from '../types/index';

// ============================================================
// Register all socket events for a connected client
// ============================================================

export function registerSocketHandlers(io: Server, socket: Socket): void {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // ── On connect: send persisted canvas state ────────────────
  const saved = getState();
  if (saved.nodes.length > 0) {
    socket.emit('canvas:loaded', { nodes: saved.nodes });
  }

  // ── canvas:generate ────────────────────────────────────────
  socket.on('canvas:generate', async (payload: CanvasGeneratePayload) => {
    const { prompt, requestId } = payload ?? {};

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      const err: CanvasErrorPayload = { message: 'Prompt cannot be empty', requestId };
      socket.emit('canvas:error', err);
      return;
    }

    console.log(`[Socket] canvas:generate from ${socket.id} — "${prompt}"`);

    try {
      const nodes = await generateCanvasNodes(prompt.trim());

      // Persist new state
      setState({ nodes, updatedAt: Date.now() });

      // Broadcast to ALL connected clients (including sender)
      const response: CanvasGeneratedPayload = { nodes, requestId };
      io.emit('canvas:generated', response);

      console.log(`[Socket] canvas:generated — ${nodes.length} nodes broadcast`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      console.error(`[Socket] Generation error: ${message}`);
      const errorPayload: CanvasErrorPayload = { message, requestId };
      socket.emit('canvas:error', errorPayload);
    }
  });

  // ── node:move ──────────────────────────────────────────────
  socket.on('node:move', (payload: NodeMovePayload) => {
    const validated = validateNodeMove(payload);
    if (!validated) {
      console.warn(`[Socket] Invalid node:move payload from ${socket.id}`);
      return;
    }

    // Update persisted position
    const state = getState();
    const updated = state.nodes.map((n) =>
      n.id === validated.id ? { ...n, x: validated.x, y: validated.y } : n
    );
    setState({ ...state, nodes: updated });

    // Broadcast to all OTHER clients
    const moved: NodeMovedPayload = { ...validated, socketId: socket.id };
    socket.broadcast.emit('node:moved', moved);
  });

  // ── disconnect ─────────────────────────────────────────────
  socket.on('disconnect', (reason) => {
    console.log(`[Socket] Client disconnected: ${socket.id} — ${reason}`);
  });
}
