import { Router, Request, Response } from 'express';
import { getState } from '../services/persistence';

const router = Router();

// ── GET /api/canvas — return current canvas state ─────────
router.get('/canvas', (_req: Request, res: Response) => {
  const state = getState();
  res.json({ success: true, data: state });
});

// ── GET /api/health ────────────────────────────────────────
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
