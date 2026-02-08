import { ipcMain, app, BrowserWindow, safeStorage, shell } from 'electron';
import Database from 'better-sqlite3';
import { TerminalManager } from './terminal-manager';
import { hideWindow } from './window';
import { reregisterGlobalShortcut } from './globalShortcut';
import { MemoryService } from './memory/memory-service';
import { SessionManager } from './memory/session-manager';
import { SearchService } from './memory/search-service';
import { ContextInjector } from './memory/context-injector';
import { AIManager } from './ai/ai-manager';
import type { AIMessage } from './ai/provider-interface';
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
    let storedKey = provider.apiKey;
    try {
      if (provider.apiKey && safeStorage.isEncryptionAvailable()) {
        storedKey = 'enc:' + safeStorage.encryptString(provider.apiKey).toString('base64');
      }
    } catch (err) {
      console.error('safeStorage encrypt failed, storing key as-is:', err);
    }

    db.prepare(
      `INSERT INTO ai_providers (name, type, api_key_encrypted, model, is_default) VALUES (?, ?, ?, ?, ?)`,
    ).run(provider.name, provider.type, storedKey, provider.model, provider.isDefault ? 1 : 0);
    return true;
  });

  ipcMain.handle('ai:list-providers', () => {
    return db.prepare('SELECT id, name, type, model, is_default, enabled FROM ai_providers').all();
  });

  // ============ Memory ============
  const memoryService = new MemoryService(db);
  const sessionManager = new SessionManager(db);
  const searchService = new SearchService(db);

  ipcMain.handle('memory:get-sessions', (_event, limit?: number) => {
    return sessionManager.getAllSessions(limit);
  });

  ipcMain.handle('memory:create-session', (_event, title: string) => {
    return sessionManager.createSession(title);
  });

  ipcMain.handle('memory:end-session', (_event, id: number, summary?: string) => {
    sessionManager.endSession(id, summary);
    return true;
  });

  ipcMain.handle('memory:get-observations', (_event, sessionId: number) => {
    return memoryService.getObservations(sessionId);
  });

  ipcMain.handle('memory:save-observation', (_event, sessionId: number, type: string, content: string, tags: string[]) => {
    return memoryService.saveObservation(sessionId, type, content, tags);
  });

  ipcMain.handle('memory:search', (_event, query: string, limit?: number) => {
    return searchService.search(query, limit);
  });

  // ============ Documents ============
  ipcMain.handle('doc:list', () => {
    return db.prepare('SELECT id, title, created_at, updated_at FROM documents ORDER BY updated_at DESC').all();
  });

  ipcMain.handle('doc:get', (_event, id: number) => {
    return db.prepare('SELECT * FROM documents WHERE id = ?').get(id);
  });

  ipcMain.handle('doc:create', (_event, title: string, content: string) => {
    const result = db.prepare('INSERT INTO documents (title, content) VALUES (?, ?)').run(title, content);
    return result.lastInsertRowid as number;
  });

  ipcMain.handle('doc:update', (_event, id: number, title: string, content: string) => {
    db.prepare("UPDATE documents SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ?").run(title, content, id);
    return true;
  });

  ipcMain.handle('doc:delete', (_event, id: number) => {
    db.prepare('DELETE FROM documents WHERE id = ?').run(id);
    return true;
  });

  // ============ Canvases ============
  ipcMain.handle('canvas:list', () => {
    return db.prepare('SELECT id, title, created_at, updated_at FROM canvases ORDER BY updated_at DESC').all();
  });

  ipcMain.handle('canvas:get', (_event, id: number) => {
    return db.prepare('SELECT * FROM canvases WHERE id = ?').get(id);
  });

  ipcMain.handle('canvas:create', (_event, title: string, data: string) => {
    const result = db.prepare('INSERT INTO canvases (title, data) VALUES (?, ?)').run(title, data);
    return result.lastInsertRowid as number;
  });

  ipcMain.handle('canvas:update', (_event, id: number, title: string, data: string) => {
    db.prepare("UPDATE canvases SET title = ?, data = ?, updated_at = datetime('now') WHERE id = ?").run(title, data, id);
    return true;
  });

  ipcMain.handle('canvas:delete', (_event, id: number) => {
    db.prepare('DELETE FROM canvases WHERE id = ?').run(id);
    return true;
  });

  // ============ Conversations ============
  ipcMain.handle('chat:list-conversations', () => {
    return db.prepare('SELECT * FROM conversations ORDER BY updated_at DESC').all();
  });

  ipcMain.handle('chat:create-conversation', (_event, title: string, providerId?: number) => {
    const result = db.prepare('INSERT INTO conversations (title, provider_id) VALUES (?, ?)').run(title, providerId ?? null);
    return result.lastInsertRowid as number;
  });

  ipcMain.handle('chat:delete-conversation', (_event, id: number) => {
    db.prepare('DELETE FROM conversations WHERE id = ?').run(id);
    return true;
  });

  ipcMain.handle('chat:get-messages', (_event, conversationId: number) => {
    return db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(conversationId);
  });

  ipcMain.handle('chat:save-message', (_event, conversationId: number, role: string, content: string) => {
    const result = db.prepare('INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)').run(conversationId, role, content);
    db.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(conversationId);
    return result.lastInsertRowid as number;
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

  // ============ Hotkeys ============
  ipcMain.handle('hotkey:set-global', (_event, accelerator: string) => {
    return reregisterGlobalShortcut(accelerator);
  });

  // ============ AI Chat ============
  const aiManager = new AIManager();
  const contextInjector = new ContextInjector(searchService);

  ipcMain.handle('ai:chat', async (
    _event,
    conversationId: number,
    messages: { role: string; content: string }[],
    providerType: string,
    apiKey: string,
    model: string,
  ) => {
    const provider = aiManager.getProvider(providerType);
    if (!provider) throw new Error(`Unknown provider: ${providerType}`);

    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    const memoryContext = lastUserMsg ? contextInjector.buildContext(lastUserMsg.content) : '';

    const enrichedMessages: AIMessage[] = messages.map((m, i) => {
      if (i === 0 && m.role === 'system' && memoryContext) {
        return { ...m, content: m.content + memoryContext } as AIMessage;
      }
      return m as AIMessage;
    });

    if (!enrichedMessages.find((m) => m.role === 'system') && memoryContext) {
      enrichedMessages.unshift({ role: 'system', content: `You are a helpful assistant.${memoryContext}` });
    }

    const response = await provider.chat(enrichedMessages, { apiKey, model });

    db.prepare('INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)').run(conversationId, 'assistant', response);
    db.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(conversationId);

    return response;
  });

  ipcMain.on('ai:chat-stream', async (event, conversationId: number, messages: { role: string; content: string }[], providerType: string, apiKey: string, model: string) => {
    const provider = aiManager.getProvider(providerType);
    if (!provider) {
      event.sender.send('ai:stream-event', { type: 'error', content: `Unknown provider: ${providerType}`, conversationId });
      return;
    }

    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    const memoryContext = lastUserMsg ? contextInjector.buildContext(lastUserMsg.content) : '';

    const enrichedMessages: AIMessage[] = messages.map((m, i) => {
      if (i === 0 && m.role === 'system' && memoryContext) {
        return { ...m, content: m.content + memoryContext } as AIMessage;
      }
      return m as AIMessage;
    });

    if (!enrichedMessages.find((m) => m.role === 'system') && memoryContext) {
      enrichedMessages.unshift({ role: 'system', content: `You are a helpful assistant.${memoryContext}` });
    }

    let fullResponse = '';

    try {
      await provider.chatStream(enrichedMessages, { apiKey, model }, (streamEvent) => {
        if (streamEvent.type === 'text') {
          fullResponse += streamEvent.content;
        }
        event.sender.send('ai:stream-event', { ...streamEvent, conversationId });
      });

      db.prepare('INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)').run(conversationId, 'assistant', fullResponse);
      db.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(conversationId);
    } catch (err: any) {
      event.sender.send('ai:stream-event', { type: 'error', content: err.message ?? 'Stream failed', conversationId });
    }
  });

  ipcMain.handle('ai:list-available-providers', () => {
    return aiManager.listProviders();
  });

  ipcMain.handle('ai:update-provider', (_event, id: number, updates: { apiKey?: string; model?: string; isDefault?: boolean; enabled?: boolean }) => {
    if (updates.apiKey !== undefined) {
      let storedKey = updates.apiKey;
      try {
        if (safeStorage.isEncryptionAvailable()) {
          storedKey = 'enc:' + safeStorage.encryptString(updates.apiKey).toString('base64');
        }
      } catch (err) {
        console.error('safeStorage encrypt failed on update:', err);
      }
      db.prepare('UPDATE ai_providers SET api_key_encrypted = ? WHERE id = ?').run(storedKey, id);
    }
    if (updates.model !== undefined) {
      db.prepare('UPDATE ai_providers SET model = ? WHERE id = ?').run(updates.model, id);
    }
    if (updates.isDefault !== undefined) {
      if (updates.isDefault) {
        db.prepare('UPDATE ai_providers SET is_default = 0').run();
      }
      db.prepare('UPDATE ai_providers SET is_default = ? WHERE id = ?').run(updates.isDefault ? 1 : 0, id);
    }
    if (updates.enabled !== undefined) {
      db.prepare('UPDATE ai_providers SET enabled = ? WHERE id = ?').run(updates.enabled ? 1 : 0, id);
    }
    return true;
  });

  ipcMain.handle('ai:delete-provider', (_event, id: number) => {
    db.prepare('DELETE FROM ai_providers WHERE id = ?').run(id);
    return true;
  });

  ipcMain.handle('ai:decrypt-key', (_event, id: number) => {
    const row = db.prepare('SELECT api_key_encrypted FROM ai_providers WHERE id = ?').get(id) as any;
    if (!row?.api_key_encrypted) return '';

    const stored = row.api_key_encrypted as string;

    // Keys prefixed with "enc:" were encrypted with safeStorage
    if (stored.startsWith('enc:')) {
      try {
        const encrypted = stored.slice(4); // remove "enc:" prefix
        return safeStorage.decryptString(Buffer.from(encrypted, 'base64'));
      } catch (err) {
        console.error('safeStorage decrypt failed for provider', id, err);
        return '';
      }
    }

    // Plain text key (safeStorage was unavailable when saved)
    return stored;
  });

  // ============ App Info ============
  ipcMain.handle('app:open-external', (_event, url: string) => {
    return shell.openExternal(url);
  });

  ipcMain.handle('app:get-path', (_event, name: string) => {
    return app.getPath(name as any);
  });

  ipcMain.handle('app:get-version', () => {
    return app.getVersion();
  });
}
