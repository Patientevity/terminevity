export const APP_NAME = 'Terminevity';
export const DEFAULT_HOTKEY = 'F1';
export const DATABASE_NAME = 'terminevity.db';
export const ANIMATION_DURATION = 0.3;

export const IPC_CHANNELS = {
  // Terminal
  TERMINAL_CREATE: 'terminal:create',
  TERMINAL_DATA: 'terminal:data',
  TERMINAL_INPUT: 'terminal:input',
  TERMINAL_RESIZE: 'terminal:resize',
  TERMINAL_CLOSE: 'terminal:close',
  // Window
  WINDOW_SHOW: 'window:show',
  WINDOW_HIDE: 'window:hide',
  WINDOW_TOGGLE: 'window:toggle',
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  // Database
  DB_QUERY: 'db:query',
  DB_RUN: 'db:run',
  DB_GET_SETTING: 'db:get-setting',
  DB_SET_SETTING: 'db:set-setting',
  // AI
  AI_CHAT: 'ai:chat',
  AI_CHAT_STREAM: 'ai:chat-stream',
  AI_LIST_PROVIDERS: 'ai:list-providers',
  AI_SET_PROVIDER: 'ai:set-provider',
  // Memory
  MEMORY_SEARCH: 'memory:search',
  MEMORY_SAVE: 'memory:save',
  MEMORY_GET_SESSIONS: 'memory:get-sessions',
  // File system
  FS_READ_DIR: 'fs:read-dir',
  FS_READ_FILE: 'fs:read-file',
  FS_WATCH: 'fs:watch',
  // Onboarding
  ONBOARDING_CHECK: 'onboarding:check',
  ONBOARDING_COMPLETE: 'onboarding:complete',
  ONBOARDING_SAVE_PROFILE: 'onboarding:save-profile',
  // App
  APP_GET_PATH: 'app:get-path',
  APP_GET_VERSION: 'app:get-version',
} as const;
