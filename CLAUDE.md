# Terminevity

Cross-platform desktop AI terminal application built with Electron + React + TypeScript.

## Architecture

- **Main process** (`electron/main/`): Electron main, node-pty terminal management, SQLite database, AI providers, MCP server
- **Preload** (`electron/preload/`): contextBridge IPC API exposing safe methods to renderer
- **Renderer** (`src/`): React 18 UI with TailwindCSS, shadcn/ui, Framer Motion animations

## Key Commands

- `npm run dev` — Start development with HMR
- `npm run build` — Production build
- `npm run preview` — Preview production build

## Tech Stack

- Electron + Vite + React 18 + TypeScript
- xterm.js + node-pty for terminal
- better-sqlite3 with WAL mode + FTS5 for persistence
- Zustand for state management
- Framer Motion for animations
- TailwindCSS + shadcn/ui for UI
- @anthropic-ai/sdk, openai, @google/generative-ai for AI
- @modelcontextprotocol/sdk for MCP

## Conventions

- All IPC communication goes through typed channels in `electron/preload/index.ts`
- Database migrations in `electron/main/migrations/` are auto-run on startup
- AI providers implement the unified interface in `electron/main/ai/provider-interface.ts`
- State stores in `src/stores/` use Zustand
- UI components follow shadcn/ui patterns with CVA variants
