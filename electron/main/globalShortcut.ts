import { globalShortcut } from 'electron';
import { toggleWindow } from './window';
import Database from 'better-sqlite3';

let currentAccelerator: string = 'F1';

export function registerGlobalShortcuts(db?: Database.Database): void {
  // Try to read the stored hotkey bindings from the database
  if (db) {
    try {
      const row = db.prepare("SELECT value FROM settings WHERE key = 'hotkey_bindings'").get() as any;
      if (row?.value) {
        const bindings = JSON.parse(row.value);
        const toggle = bindings['toggle-window'];
        if (toggle) {
          currentAccelerator = comboToAccelerator(toggle);
        }
      }
    } catch {
      // Fall back to default F1
    }
  }

  globalShortcut.register(currentAccelerator, () => {
    toggleWindow();
  });
}

export function reregisterGlobalShortcut(accelerator: string): boolean {
  try {
    globalShortcut.unregister(currentAccelerator);
  } catch {
    // Previous shortcut may not have been registered
  }

  try {
    const success = globalShortcut.register(accelerator, () => {
      toggleWindow();
    });
    if (success) {
      currentAccelerator = accelerator;
    }
    return success;
  } catch {
    // If new shortcut fails, try to re-register the old one
    try {
      globalShortcut.register(currentAccelerator, () => {
        toggleWindow();
      });
    } catch {
      // Nothing we can do
    }
    return false;
  }
}

export function unregisterGlobalShortcuts(): void {
  globalShortcut.unregisterAll();
}

function comboToAccelerator(combo: { key: string; ctrl: boolean; shift: boolean; alt: boolean; meta: boolean }): string {
  const parts: string[] = [];
  if (combo.ctrl) parts.push('Ctrl');
  if (combo.meta) parts.push('Super');
  if (combo.shift) parts.push('Shift');
  if (combo.alt) parts.push('Alt');

  const keyMap: Record<string, string> = {
    'ArrowUp': 'Up',
    'ArrowDown': 'Down',
    'ArrowLeft': 'Left',
    'ArrowRight': 'Right',
    ' ': 'Space',
  };

  const key = keyMap[combo.key] ?? (combo.key.length === 1 ? combo.key.toUpperCase() : combo.key);
  parts.push(key);
  return parts.join('+');
}
