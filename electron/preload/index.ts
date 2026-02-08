import { contextBridge, ipcRenderer } from 'electron';

const api = {
  // Window controls
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    hideComplete: () => ipcRenderer.send('window:hide-complete'),
    onAnimateShow: (callback: () => void) => {
      const handler = () => callback();
      ipcRenderer.on('window:animate-show', handler);
      return () => ipcRenderer.removeListener('window:animate-show', handler);
    },
    onAnimateHide: (callback: () => void) => {
      const handler = () => callback();
      ipcRenderer.on('window:animate-hide', handler);
      return () => ipcRenderer.removeListener('window:animate-hide', handler);
    },
  },

  // Terminal
  terminal: {
    create: (id: string, cwd?: string) => ipcRenderer.invoke('terminal:create', id, cwd),
    input: (id: string, data: string) => ipcRenderer.send('terminal:input', id, data),
    resize: (id: string, cols: number, rows: number) => ipcRenderer.send('terminal:resize', id, cols, rows),
    close: (id: string) => ipcRenderer.send('terminal:close', id),
    getTitle: (id: string) => ipcRenderer.invoke('terminal:get-title', id),
    onData: (callback: (id: string, data: string) => void) => {
      const handler = (_event: any, id: string, data: string) => callback(id, data);
      ipcRenderer.on('terminal:data', handler);
      return () => ipcRenderer.removeListener('terminal:data', handler);
    },
    onExit: (callback: (id: string, exitCode: number) => void) => {
      const handler = (_event: any, id: string, exitCode: number) => callback(id, exitCode);
      ipcRenderer.on('terminal:exit', handler);
      return () => ipcRenderer.removeListener('terminal:exit', handler);
    },
  },

  // Database
  db: {
    getSetting: (key: string) => ipcRenderer.invoke('db:get-setting', key),
    setSetting: (key: string, value: string) => ipcRenderer.invoke('db:set-setting', key, value),
  },

  // Onboarding
  onboarding: {
    check: () => ipcRenderer.invoke('onboarding:check'),
    complete: () => ipcRenderer.invoke('onboarding:complete'),
    saveProfile: (profile: {
      name: string;
      goals: string;
      intents: string;
      preferredNoteTool: string;
    }) => ipcRenderer.invoke('onboarding:save-profile', profile),
  },

  // AI Providers
  ai: {
    saveProvider: (provider: {
      name: string;
      type: string;
      apiKey: string;
      model: string;
      isDefault: boolean;
    }) => ipcRenderer.invoke('ai:save-provider', provider),
    listProviders: () => ipcRenderer.invoke('ai:list-providers'),
    listAvailableProviders: () => ipcRenderer.invoke('ai:list-available-providers'),
    updateProvider: (id: number, updates: { apiKey?: string; model?: string; isDefault?: boolean; enabled?: boolean }) =>
      ipcRenderer.invoke('ai:update-provider', id, updates),
    deleteProvider: (id: number) => ipcRenderer.invoke('ai:delete-provider', id),
    decryptKey: (id: number) => ipcRenderer.invoke('ai:decrypt-key', id),
    chat: (conversationId: number, messages: { role: string; content: string }[], providerType: string, apiKey: string, model: string) =>
      ipcRenderer.invoke('ai:chat', conversationId, messages, providerType, apiKey, model),
    chatStream: (conversationId: number, messages: { role: string; content: string }[], providerType: string, apiKey: string, model: string) => {
      ipcRenderer.send('ai:chat-stream', conversationId, messages, providerType, apiKey, model);
    },
    onStreamEvent: (callback: (event: { type: string; content: string; conversationId: number }) => void) => {
      const handler = (_event: any, data: { type: string; content: string; conversationId: number }) => callback(data);
      ipcRenderer.on('ai:stream-event', handler);
      return () => ipcRenderer.removeListener('ai:stream-event', handler);
    },
  },

  // Memory
  memory: {
    getSessions: (limit?: number) => ipcRenderer.invoke('memory:get-sessions', limit),
    createSession: (title: string) => ipcRenderer.invoke('memory:create-session', title),
    endSession: (id: number, summary?: string) => ipcRenderer.invoke('memory:end-session', id, summary),
    getObservations: (sessionId: number) => ipcRenderer.invoke('memory:get-observations', sessionId),
    saveObservation: (sessionId: number, type: string, content: string, tags: string[]) =>
      ipcRenderer.invoke('memory:save-observation', sessionId, type, content, tags),
    search: (query: string, limit?: number) => ipcRenderer.invoke('memory:search', query, limit),
  },

  // Documents
  doc: {
    list: () => ipcRenderer.invoke('doc:list'),
    get: (id: number) => ipcRenderer.invoke('doc:get', id),
    create: (title: string, content: string) => ipcRenderer.invoke('doc:create', title, content),
    update: (id: number, title: string, content: string) => ipcRenderer.invoke('doc:update', id, title, content),
    delete: (id: number) => ipcRenderer.invoke('doc:delete', id),
  },

  // Canvases
  canvas: {
    list: () => ipcRenderer.invoke('canvas:list'),
    get: (id: number) => ipcRenderer.invoke('canvas:get', id),
    create: (title: string, data: string) => ipcRenderer.invoke('canvas:create', title, data),
    update: (id: number, title: string, data: string) => ipcRenderer.invoke('canvas:update', id, title, data),
    delete: (id: number) => ipcRenderer.invoke('canvas:delete', id),
  },

  // Conversations
  chat: {
    listConversations: () => ipcRenderer.invoke('chat:list-conversations'),
    createConversation: (title: string, providerId?: number) => ipcRenderer.invoke('chat:create-conversation', title, providerId),
    deleteConversation: (id: number) => ipcRenderer.invoke('chat:delete-conversation', id),
    getMessages: (conversationId: number) => ipcRenderer.invoke('chat:get-messages', conversationId),
    saveMessage: (conversationId: number, role: string, content: string) => ipcRenderer.invoke('chat:save-message', conversationId, role, content),
  },

  // File system
  fs: {
    readDir: (dirPath: string) => ipcRenderer.invoke('fs:read-dir', dirPath),
    readFile: (filePath: string) => ipcRenderer.invoke('fs:read-file', filePath),
  },

  // Hotkeys
  hotkey: {
    setGlobal: (accelerator: string) => ipcRenderer.invoke('hotkey:set-global', accelerator),
  },

  // App
  app: {
    openExternal: (url: string) => ipcRenderer.invoke('app:open-external', url),
    getPath: (name: string) => ipcRenderer.invoke('app:get-path', name),
    getVersion: () => ipcRenderer.invoke('app:get-version'),
  },
};

contextBridge.exposeInMainWorld('api', api);

// Type declaration for renderer
export type API = typeof api;
