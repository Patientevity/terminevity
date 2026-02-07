# Terminevity

A cross-platform desktop AI terminal application that brings together a full-featured terminal emulator, AI chat, markdown editing, a freeform canvas, file exploration, persistent memory, and deep research -- all in a single, keyboard-driven workspace.

Built and maintained by **Raymond Hughes** at **Patientevity EHR**.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Default Keyboard Shortcuts](#default-keyboard-shortcuts)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development](#development)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [Code Style and Conventions](#code-style-and-conventions)
- [Reporting Issues](#reporting-issues)
- [License](#license)

---

## Overview

Terminevity is a desktop application built on Electron, React 18, and TypeScript. It is designed as a productivity hub for developers who want their terminal, AI assistant, notes, and research tools within arm's reach -- toggled into view with a single global hotkey.

The application runs on Windows, macOS, and Linux.

---

## Features

- **Terminal Emulator** -- Full xterm.js terminal backed by node-pty. Multiple tabs, split panes, and shell auto-detection.
- **AI Chat** -- Integrated conversational AI with support for Anthropic (Claude), OpenAI, and Google Generative AI providers.
- **Markdown Editor** -- CodeMirror-powered editor with GitHub Flavored Markdown and syntax highlighting.
- **Canvas** -- Freeform drawing and diagramming surface powered by Excalidraw.
- **File Explorer** -- Browse and open files directly from the application.
- **Memory System** -- Persistent observations stored in SQLite with full-text search, giving the AI long-term context.
- **Research Panel** -- Dedicated space for deep research workflows.
- **Model Context Protocol (MCP)** -- Extensible tool integration through the MCP SDK.
- **Customizable Hotkeys** -- Every keyboard shortcut can be remapped from Settings. The global toggle key is re-registered dynamically at the OS level.
- **System Tray** -- Runs in the background and appears instantly when summoned.

---

## Default Keyboard Shortcuts

All shortcuts can be customized in **Settings > Hotkeys**.

| Action | Default Binding | Category |
|---|---|---|
| Toggle Window (global) | `F1` | Global |
| New Terminal Tab | `Ctrl+T` | Terminal |
| Close Terminal Tab | `Ctrl+W` | Terminal |
| Next Tab | `Ctrl+Tab` | Terminal |
| Previous Tab | `Ctrl+Shift+Tab` | Terminal |
| Split Pane Right | `Ctrl+Shift+Right` | Layout |
| Split Pane Down | `Ctrl+Shift+Down` | Layout |
| Split Pane Left | `Ctrl+Shift+Left` | Layout |
| Split Pane Up | `Ctrl+Shift+Up` | Layout |
| Switch to Terminal | `Ctrl+1` | View |
| Switch to AI Chat | `Ctrl+2` | View |
| Switch to Markdown | `Ctrl+3` | View |
| Switch to Canvas | `Ctrl+4` | View |
| Switch to Explorer | `Ctrl+5` | View |
| Switch to Memory | `Ctrl+6` | View |
| Switch to Research | `Ctrl+7` | View |
| Open Settings | `Ctrl+,` | View |
| Toggle Sidebar | `Ctrl+B` | App |
| Command Palette | `Ctrl+Shift+P` | App |

On macOS, `Ctrl` is treated as equivalent to `Cmd`, and display labels use native Mac symbols.

---

## Prerequisites

Before you begin, make sure the following tools are installed:

- **Node.js** -- version 18 or later (LTS recommended)
- **npm** -- ships with Node.js
- **Git** -- for cloning the repository
- **Python 3** and a C++ build toolchain -- required by native modules (`node-pty`, `better-sqlite3`). On Ubuntu/Debian this means `build-essential`. On macOS, install Xcode Command Line Tools. On Windows, install the "Desktop development with C++" workload from Visual Studio Build Tools.

---

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/patientevity/terminevity.git
   cd terminevity
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   This also runs `electron-builder install-app-deps` as a postinstall step, which compiles native modules for your platform.

3. **Start the development server**

   ```bash
   npm run dev
   ```

   Vite will start the renderer with hot module replacement, and Electron will launch automatically. The application should appear within a few seconds.

4. **Build for production**

   ```bash
   npm run build
   ```

   The compiled output is placed in `dist-electron/` (main process) and `dist/` (renderer). You can package a distributable using electron-builder:

   ```bash
   npx electron-builder
   ```

5. **Preview the production build** (without packaging)

   ```bash
   npm run preview
   ```

---

## Development

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development with Vite HMR and Electron |
| `npm run build` | Type-check with TypeScript and build for production |
| `npm run preview` | Preview the production build locally |

### Database

Terminevity uses **better-sqlite3** with WAL mode for all persistence. The database file lives at `<userData>/terminevity.db`. Migrations are located in `electron/main/migrations/` and run automatically on startup in sequential order.

Settings are stored as key-value pairs in the `settings` table. Hotkey bindings are persisted as a single JSON blob under the key `hotkey_bindings`.

### Hot Reload

The renderer supports full HMR through Vite. Changes to React components, stores, and styles are reflected immediately without restarting the application. Changes to the Electron main process or preload script require a restart (`Ctrl+C` and `npm run dev` again).

---

## Project Structure

```
terminevity/
  electron/
    main/
      index.ts              -- Electron app entry point
      window.ts             -- Window creation and lifecycle
      globalShortcut.ts     -- Global OS-level hotkey registration
      ipc-handlers.ts       -- IPC handler registration
      database.ts           -- Database initialization
      terminal-manager.ts   -- node-pty terminal lifecycle
      migrations/           -- SQLite schema migrations
      ai/                   -- AI provider implementations
      memory/               -- Memory system backend
      mcp/                  -- Model Context Protocol server
    preload/
      index.ts              -- Context bridge (safe IPC API for renderer)
  src/
    App.tsx                 -- Root React component
    main.tsx                -- React entry point
    components/
      layout/               -- AppShell, Sidebar, TopBar, StatusBar, PanelManager
      terminal/             -- Terminal emulator, tabs, split views
      chat/                 -- AI chat panel
      markdown/             -- Markdown editor
      canvas/               -- Canvas / Excalidraw wrapper
      explorer/             -- File explorer
      memory/               -- Memory viewer
      research/             -- Research panel
      settings/             -- Settings page, hotkey configuration UI
      onboarding/           -- First-run onboarding flow
      ui/                   -- Shared shadcn/ui primitives
    stores/                 -- Zustand state management
    types/                  -- TypeScript type definitions
    hooks/                  -- Custom React hooks
    lib/                    -- Utilities, constants, IPC helpers
```

---

## Architecture

Terminevity follows the standard Electron three-process model:

1. **Main Process** (`electron/main/`) -- Node.js environment. Manages the window, system tray, global shortcuts, database, terminal processes (via node-pty), AI provider calls, and all IPC handlers.

2. **Preload Script** (`electron/preload/index.ts`) -- Bridges main and renderer through `contextBridge.exposeInMainWorld`. Every IPC channel is explicitly listed here; the renderer never has direct access to Node.js or Electron APIs.

3. **Renderer Process** (`src/`) -- React 18 single-page application. State is managed with Zustand stores. UI is built with TailwindCSS and shadcn/ui components. Animations use Framer Motion.

### Key Design Principles

- **Type safety end to end.** The preload API is typed, and the renderer imports `API` as a type so that `window.api` calls are fully checked at compile time.
- **State in Zustand, persistence in SQLite.** Each store's setter updates in-memory state immediately and then fires an async IPC call to persist to the database. On startup, `loadFromDb()` hydrates the store from the database.
- **Keyboard-first interaction.** The hotkey dispatcher uses a DOM `keydown` listener in the capture phase so it fires before xterm or other components consume the event. Bare key presses are passed through to terminals and inputs; only key combinations with modifiers are intercepted.
- **No new migrations for settings.** Hotkey bindings, AI provider configs, and similar blobs are stored as JSON values in the existing `settings` table.

---

## Contributing

Contributions are welcome. Here is how to get involved:

1. **Fork the repository** and create a feature branch from `main`.

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes.** Follow the conventions described below. Write clear commit messages that explain *why* the change was made, not just what was changed.

3. **Test your changes.** Run the application locally with `npm run dev` and verify that existing functionality is not broken. Run the type checker:

   ```bash
   npx tsc --noEmit
   ```

4. **Open a pull request.** Describe what your PR does, why it is needed, and how to test it. Reference any related issues.

### What We Look For in Pull Requests

- The change compiles without TypeScript errors.
- New stores, hooks, and components follow existing naming and structural patterns.
- IPC channels are added to the preload script, the IPC handler file, and the constants file -- all three.
- No secrets, API keys, or credentials are committed.
- The PR is focused. One feature or fix per pull request.

---

## Code Style and Conventions

- **Language:** TypeScript throughout. Strict mode is enabled.
- **State Management:** Zustand. One store per domain (app, terminal, settings, hotkeys, etc.). Actions live inside the store definition.
- **Components:** Functional React components with hooks. shadcn/ui primitives are in `src/components/ui/`. Application components live in feature directories under `src/components/`.
- **Styling:** TailwindCSS utility classes. Component variants use `class-variance-authority`. Class merging uses `tailwind-merge` via the `cn()` helper.
- **IPC:** All communication between renderer and main process goes through typed channels defined in `electron/preload/index.ts`. Use `ipcMain.handle` for request/response and `ipcMain.on` for fire-and-forget messages.
- **Database:** Migrations in `electron/main/migrations/` are numbered sequentially (e.g., `001-initial-schema.ts`). Each migration exports an `up` function that receives the database instance.
- **Naming:** Files use kebab-case. React components use PascalCase. Zustand stores export a `use<Name>Store` hook.

---

## Reporting Issues

If you find a bug or have a feature request, please open an issue on the GitHub repository. Include:

- A clear description of the problem or feature.
- Steps to reproduce (for bugs).
- Your operating system, Node.js version, and Electron version.
- Any relevant error messages or screenshots.

---

## License

Copyright Patientevity EHR. All rights reserved.

For licensing inquiries, contact the maintainers.

---

*Maintained by Raymond Hughes at Patientevity EHR.*
