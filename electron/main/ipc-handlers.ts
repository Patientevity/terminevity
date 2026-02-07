import { ipcMain, app, BrowserWindow, safeStorage } from 'electron';
import Database from 'better-sqlite3';
import { TerminalManager } from './terminal-manager';
import { hideWindow } from './window';
import fs from 'fs';
import path from 'path';

export function registerIpcHandlers(
  db: Database.Database,
  terminalManager: TerminalManager,
): void {
  // ============ Window Controls ============
  ipcMain.on('window:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
  });

  ipcMain.on('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  });

  ipcMain.on('window:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close();
  });

  ipcMain.on('window:hide-complete', () => {
    hideWindow();
  });

  // ============ Terminal ============
  ipcMain.handle('terminal:create', (event, id: string, cwd?: string) => {
    return terminalManager.create(id, cwd, event.sender);
  });

  ipcMain.on('terminal:input', (_event, id: string, data: string) => {
    terminalManager.write(id, data);
  });

  ipcMain.on('terminal:resize', (_event, id: string, cols: number, rows: number) => {
    terminalManager.resize(id, cols, rows);
  });

  ipcMain.on('terminal:close', (_event, id: string) => {
    terminalManager.dispose(id);
  });

  ipcMain.handle('terminal:get-title', (_event, id: string) => {
    return terminalManager.getTitle(id);
  });

  // ============ Database ============
  ipcMain.handle('db:get-setting', (_event, key: string) => {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as any;
    return row?.value ?? null;
  });

  ipcMain.handle('db:set-setting', (_event, key: string, value: string) => {
    db.prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    ).run(key, value);
    return true;
  });

  // ============ Onboarding ============
  ipcMain.handle('onboarding:check', () => {
    const row = db.prepare("SELECT value FROM settings WHERE key = 'onboarding_complete'").get() as any;
    return row?.value === 'true';
  });

  ipcMain.handle('onboarding:complete', () => {
    db.prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES ('onboarding_complete', 'true', datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = 'true', updated_at = datetime('now')`,
    ).run();
    return true;
  });

  ipcMain.handle('onboarding:save-profile', (_event, profile: {
    name: string;
    goals: string;
    intents: string;
    preferredNoteTool: string;
  }) => {
    const existing = db.prepare('SELECT id FROM user_profile LIMIT 1').get() as any;
    if (existing) {
      db.prepare(
        `UPDATE user_profile SET name = ?, goals = ?, intents = ?, preferred_note_tool = ?, updated_at = datetime('now') WHERE id = ?`,
      ).run(profile.name, profile.goals, profile.intents, profile.preferredNoteTool, existing.id);
    } else {
      db.prepare(
        `INSERT INTO user_profile (name, goals, intents, preferred_note_tool) VALUES (?, ?, ?, ?)`,
      ).run(profile.name, profile.goals, profile.intents, profile.preferredNoteTool);
    }
    return true;
  });

  // ============ AI Providers ============
  ipcMain.handle('ai:save-provider', (_event, provider: {
    name: string;
    type: string;
    apiKey: string;
    model: string;
    isDefault: boolean;
  }) => {
    let encryptedKey = '';
    if (provider.apiKey && safeStorage.isEncryptionAvailable()) {
      encryptedKey = safeStorage.encryptString(provider.apiKey).toString('base64');
    } else {
      encryptedKey = provider.apiKey; // Fallback: store as-is
    }

    db.prepare(
      `INSERT INTO ai_providers (name, type, api_key_encrypted, model, is_default) VALUES (?, ?, ?, ?, ?)`,
    ).run(provider.name, provider.type, encryptedKey, provider.model, provider.isDefault ? 1 : 0);
    return true;
  });

  ipcMain.handle('ai:list-providers', () => {
    return db.prepare('SELECT id, name, type, model, is_default, enabled FROM ai_providers').all();
  });

  // ============ File System ============
  ipcMain.handle('fs:read-dir', (_event, dirPath: string) => {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      return entries.map((entry) => ({
        name: entry.name,
        path: path.join(dirPath, entry.name),
        isDirectory: entry.isDirectory(),
        isFile: entry.isFile(),
      }));
    } catch {
      return [];
    }
  });

  ipcMain.handle('fs:read-file', (_event, filePath: string) => {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch {
      return null;
    }
  });

  // ============ App Info ============
  ipcMain.handle('app:get-path', (_event, name: string) => {
    return app.getPath(name as any);
  });

  ipcMain.handle('app:get-version', () => {
    return app.getVersion();
  });
}
