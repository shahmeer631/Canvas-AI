import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import apiRoutes from './routes/api';
import { registerSocketHandlers } from './sockets/canvasSocket';
import { loadState } from './services/persistence';

// ============================================================
// Bootstrap
// ============================================================

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173';

const app = express();
const httpServer = createServer(app);

// ── Socket.io server ───────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // Reconnection support
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ── Middleware ─────────────────────────────────────────────
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// ── REST routes ────────────────────────────────────────────
app.use('/api', apiRoutes);

// ── Socket connections ─────────────────────────────────────
io.on('connection', (socket) => {
  registerSocketHandlers(io, socket);
});

// ── Load persisted canvas state ────────────────────────────
loadState();

// ── Start ──────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Canvas AI Backend running at http://localhost:${PORT}`);
  console.log(`   Socket.io  → ws://localhost:${PORT}`);
  console.log(`   CORS origin → ${CLIENT_URL}`);
  console.log(`   AI provider → ${process.env.AI_PROVIDER ?? 'groq'}\n`);
});

export { io };
