export * from './terminal';
export * from './database';
export * from './hotkeys';

export type ViewType = 'terminal' | 'chat' | 'markdown' | 'canvas' | 'explorer' | 'memory' | 'research' | 'settings';

export interface AppState {
  isOnboarded: boolean;
  currentView: ViewType;
  sidebarCollapsed: boolean;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIStreamChunk {
  type: 'text' | 'done' | 'error';
  content: string;
}

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  isFile: boolean;
  size: number;
  modified: string;
  children?: FileEntry[];
}
