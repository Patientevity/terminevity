import type { HotkeyAction, HotkeyActionId, HotkeyBindingsMap, KeyCombo } from '@/types/hotkeys';

export const HOTKEY_ACTIONS: HotkeyAction[] = [
  // Global
  { id: 'toggle-window', label: 'Toggle Window', category: 'global', description: 'Show or hide the application window' },

  // Terminal
  { id: 'new-terminal-tab', label: 'New Terminal Tab', category: 'terminal', description: 'Open a new terminal tab' },
  { id: 'close-terminal-tab', label: 'Close Terminal Tab', category: 'terminal', description: 'Close the active terminal tab' },
  { id: 'next-tab', label: 'Next Tab', category: 'terminal', description: 'Switch to the next terminal tab' },
  { id: 'previous-tab', label: 'Previous Tab', category: 'terminal', description: 'Switch to the previous terminal tab' },

  // Layout
  { id: 'split-pane-right', label: 'Split Pane Right', category: 'layout', description: 'Split the current pane to the right' },
  { id: 'split-pane-down', label: 'Split Pane Down', category: 'layout', description: 'Split the current pane downward' },
  { id: 'split-pane-left', label: 'Split Pane Left', category: 'layout', description: 'Split the current pane to the left' },
  { id: 'split-pane-up', label: 'Split Pane Up', category: 'layout', description: 'Split the current pane upward' },

  // View
  { id: 'switch-to-terminal', label: 'Switch to Terminal', category: 'view', description: 'Switch to the terminal view' },
  { id: 'switch-to-chat', label: 'Switch to AI Chat', category: 'view', description: 'Switch to the AI chat view' },
  { id: 'switch-to-markdown', label: 'Switch to Markdown', category: 'view', description: 'Switch to the markdown editor' },
  { id: 'switch-to-canvas', label: 'Switch to Canvas', category: 'view', description: 'Switch to the canvas view' },
  { id: 'switch-to-explorer', label: 'Switch to Explorer', category: 'view', description: 'Switch to the file explorer' },
  { id: 'switch-to-memory', label: 'Switch to Memory', category: 'view', description: 'Switch to the memory viewer' },
  { id: 'switch-to-research', label: 'Switch to Research', category: 'view', description: 'Switch to the research panel' },
  { id: 'open-settings', label: 'Open Settings', category: 'view', description: 'Open the settings page' },

  // App
  { id: 'toggle-sidebar', label: 'Toggle Sidebar', category: 'app', description: 'Toggle the sidebar visibility' },
  { id: 'command-palette', label: 'Command Palette', category: 'app', description: 'Open the command palette' },
];

function combo(key: string, ctrl = false, shift = false, alt = false, meta = false): KeyCombo {
  return { key, ctrl, shift, alt, meta };
}

const DEFAULT_BINDINGS: HotkeyBindingsMap = {
  'toggle-window': combo('F1'),
  'new-terminal-tab': combo('t', true),
  'close-terminal-tab': combo('w', true),
  'next-tab': combo('Tab', true),
  'previous-tab': combo('Tab', true, true),
  'split-pane-right': combo('ArrowRight', true, true),
  'split-pane-down': combo('ArrowDown', true, true),
  'split-pane-left': combo('ArrowLeft', true, true),
  'split-pane-up': combo('ArrowUp', true, true),
  'switch-to-terminal': combo('1', true),
  'switch-to-chat': combo('2', true),
  'switch-to-markdown': combo('3', true),
  'switch-to-canvas': combo('4', true),
  'switch-to-explorer': combo('5', true),
  'switch-to-memory': combo('6', true),
  'switch-to-research': combo('7', true),
  'open-settings': combo(',', true),
  'toggle-sidebar': combo('b', true),
  'command-palette': combo('p', true, true),
};

export function getDefaultBindings(): HotkeyBindingsMap {
  return { ...DEFAULT_BINDINGS };
}

export function getDefaultBinding(actionId: HotkeyActionId): KeyCombo {
  return { ...DEFAULT_BINDINGS[actionId] };
}

export function getActionById(actionId: HotkeyActionId): HotkeyAction | undefined {
  return HOTKEY_ACTIONS.find((a) => a.id === actionId);
}

export const CATEGORY_LABELS: Record<string, string> = {
  global: 'Global',
  terminal: 'Terminal',
  view: 'View',
  layout: 'Layout',
  app: 'App',
};

export const CATEGORY_ORDER: string[] = ['global', 'terminal', 'view', 'layout', 'app'];
