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
  },

  // File system
  fs: {
    readDir: (dirPath: string) => ipcRenderer.invoke('fs:read-dir', dirPath),
    readFile: (filePath: string) => ipcRenderer.invoke('fs:read-file', filePath),
  },

  // App
  app: {
    getPath: (name: string) => ipcRenderer.invoke('app:get-path', name),
    getVersion: () => ipcRenderer.invoke('app:get-version'),
  },
};

contextBridge.exposeInMainWorld('api', api);

// Type declaration for renderer
export type API = typeof api;
