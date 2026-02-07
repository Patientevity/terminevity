export type HotkeyCategory = 'global' | 'terminal' | 'view' | 'layout' | 'app';

export type HotkeyActionId =
  | 'toggle-window'
  | 'new-terminal-tab'
  | 'close-terminal-tab'
  | 'next-tab'
  | 'previous-tab'
  | 'split-pane-right'
  | 'split-pane-down'
  | 'split-pane-left'
  | 'split-pane-up'
  | 'switch-to-terminal'
  | 'switch-to-chat'
  | 'switch-to-markdown'
  | 'switch-to-canvas'
  | 'switch-to-explorer'
  | 'switch-to-memory'
  | 'switch-to-research'
  | 'open-settings'
  | 'toggle-sidebar'
  | 'command-palette';

export interface KeyCombo {
  key: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
}

export interface HotkeyAction {
  id: HotkeyActionId;
  label: string;
  category: HotkeyCategory;
  description: string;
}

export type HotkeyBindingsMap = Record<HotkeyActionId, KeyCombo>;
