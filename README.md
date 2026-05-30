# 🎨 Canvas AI — Real-time Collaborative Node Editor

A production-ready full-stack application where users describe a canvas layout in natural language, an AI generates it as structured nodes, and all connected users see and interact with it in real-time.

---

## ✨ Features

- **AI-powered generation** — describe a layout, AI returns strict structured JSON
- **Real-time collaboration** — drag nodes and all connected tabs sync instantly via WebSockets
- **Persistent state** — canvas survives page refresh (JSON file persistence)
- **Undo/Redo** — full history with Ctrl/Cmd+Z / Y
- **Zoom & Pan** — scroll to zoom, drag stage to pan
- **Validation** — Zod-validated AI output, auto-clamped to canvas bounds
- **Retry logic** — AI calls retry up to 2 times on failure
- **Dark UI** — polished dark theme with Tailwind

---

## 🗂 Project Structure

```
canvas-app/
├── backend/
│   ├── src/
│   │   ├── ai/           generator.ts — AI prompt + retry logic
│   │   ├── routes/       api.ts — REST endpoints
│   │   ├── services/     validation.ts, persistence.ts
│   │   ├── sockets/      canvasSocket.ts — all socket events
│   │   ├── types/        index.ts — shared types
│   │   └── index.ts      — Express + Socket.io bootstrap
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── canvas/       CanvasView.tsx, CanvasNodes.tsx
    │   ├── components/   Header, PromptBar, EmptyState, LoadingOverlay
    │   ├── hooks/        useSocket.ts, useKeyboardShortcuts.ts
    │   ├── pages/        AppPage.tsx
    │   ├── services/     socket.ts — singleton socket client
    │   ├── store/        canvasStore.ts — Zustand store
    │   ├── types/        index.ts
    │   └── utils/        constants.ts
    ├── .env.example
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── tsconfig.json
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=3001
CLIENT_URL=http://localhost:5173
AI_PROVIDER=groq          # "groq" | "openai"
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-...     # optional, if using openai provider
```

### Frontend (`frontend/.env`)

```env
VITE_BACKEND_URL=http://localhost:3001
```

---

## 🚀 Installation & Running

### Prerequisites
- Node.js 18+
- A Groq API key (free at https://console.groq.com) OR an OpenAI key

### 1. Clone & install

```bash
git clone <repo>

# Install backend
cd canvas-app/backend
npm install

# Install frontend
cd ../frontend
npm install
```

### 2. Configure environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env — add your GROQ_API_KEY or OPENAI_API_KEY

# Frontend
cd ../frontend
cp .env.example .env
# Edit .env if backend runs on a different port
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open **http://localhost:5173**

---

## 🧩 AI Provider Setup

### Groq (recommended — free, fast)
1. Sign up at https://console.groq.com
2. Create an API key
3. Set `GROQ_API_KEY=gsk_...` and `AI_PROVIDER=groq` in `backend/.env`

### OpenAI
1. Get an API key at https://platform.openai.com
2. Set `OPENAI_API_KEY=sk-...` and `AI_PROVIDER=openai` in `backend/.env`

---

## 📡 Socket Architecture

```
Client                          Server
  │                               │
  ├─ canvas:generate ────────────►│
  │   { prompt, requestId }       │── generateCanvasNodes()
  │                               │── validateAndSanitize()
  │◄──────────── canvas:generated─┤ (broadcast to ALL)
  │   { nodes, requestId }        │
  │                               │
  ├─ node:move ──────────────────►│
  │   { id, x, y }                │── setState() (debounced)
  │◄────────────── node:moved ────┤ (broadcast to all OTHERS)
  │   { id, x, y, socketId }      │
```

**Events:**

| Event | Direction | Description |
|---|---|---|
| `canvas:generate` | Client → Server | Request AI generation |
| `canvas:generated` | Server → All clients | New layout ready |
| `canvas:loaded` | Server → New client | Restore persisted state |
| `canvas:error` | Server → Client | Generation failed |
| `node:move` | Client → Server | Node dragged |
| `node:moved` | Server → Other clients | Sync drag position |

---

## 🔒 Validation Rules

Enforced by Zod on the backend:

- Shape types: `circle` or `rectangle` only
- Max 12 nodes per canvas
- Labels: max 2 characters
- Positions auto-clamped to canvas bounds (1000×700)
- Colors: valid hex/rgb/hsl only
- Duplicate IDs are deduplicated

---

## 🧠 AI Prompt Engineering

The system prompt (`backend/src/ai/generator.ts`) enforces:
- JSON-only output (no markdown, no code blocks)
- Strict schema with all required fields
- Canvas boundary constraints
- Aesthetic layout guidance (star patterns, grids, spacing)
- Retry logic: 2 attempts before surfacing error to user

---

## 🎨 Sample Prompts

```
Create a star layout with 1 center node and 6 surrounding nodes
Create a 3x4 grid of circles labeled A-L
Create 4 rectangles in a row and 1 circle above center
Create 6 circles around one center circle
Make a timeline of 5 rectangles left to right labeled 1-5
```

---

## 🔧 Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| Scroll | Pan canvas up/down |
| `↑` / `↓` | Pan canvas up/down |
| `Ctrl/Cmd + Scroll` | Zoom canvas |
| Drag stage | Pan canvas |
| Drag node | Reposition (syncs in real-time) |

---

## 🏗 Architecture Decisions

1. **Zustand over Redux** — minimal boilerplate, perfect for this scale
2. **React Konva** — Canvas API abstraction with React components, enables performant dragging without DOM overhead
3. **Zod validation** — runtime type safety for AI responses (AI output is unpredictable)
4. **Groq default** — free, extremely fast (sub-second), llama3-70b produces clean JSON reliably
5. **JSON file persistence** — simplest possible persistence, easy to swap for a real DB
6. **Socket.io over raw WebSockets** — auto-reconnect, namespaces, rooms — production-ready out of the box
7. **Debounced disk writes** — prevents file I/O thrashing during rapid node drags

---

## 🔮 Scaling Improvements

- Replace JSON file with Redis for multi-server persistence
- Add Socket.io rooms for multiple canvas sessions
- Add authentication and user cursors (collaborative presence)
- Use canvas:generate with optimistic UI and rollback on error
- Add a message queue (BullMQ) for AI requests under load
- Replace Konva with a WebGL renderer (PixiJS) for 1000+ nodes
- Add vector search for prompt history / suggestions

---

## 📝 Submission Notes

### AI tools used

- **Cursor** — IDE for development and project setup
- **Claude** — AI assistant for architecture, code review, and implementation help
- **Groq API** (llama-3.3-70b-versatile) — LLM used for prompt → structured JSON generation (via `GROQ_API_KEY`)

### What I'd improve next

- **Multi-canvas sessions** — Socket.io rooms so each user/group gets an isolated canvas
- **Live drag sync** — emit `node:move` during drag (throttled), not only on drag end
- **Redis persistence** — replace the JSON file so the app scales across multiple server instances
- **Collaborative presence** — show other users' cursors and who is dragging which node
- **Gemini provider** — wire up the API key already listed in `.env.example`
- **Optimistic generation UI** — show a skeleton layout while AI is running, rollback on error

---

## 📦 Build for Production

```bash
# Backend
cd backend && npm run build && node dist/index.js

# Frontend
cd frontend && npm run build
# Serve dist/ with nginx or any static host
```
