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

  try {
    globalShortcut.register(currentAccelerator, () => {
      toggleWindow();
    });
    console.log(`[Hotkey] Registered global shortcut: ${currentAccelerator}`);
    if (!globalShortcut.isRegistered(currentAccelerator)) {
      console.warn(`[Hotkey] Registration check failed for: ${currentAccelerator}`);
    }
  } catch (err) {
    console.error(`[Hotkey] Failed to register ${currentAccelerator}:`, err);
  }
}

export function reregisterGlobalShortcut(accelerator: string): boolean {
  const previous = currentAccelerator;

  try {
    globalShortcut.unregisterAll();
  } catch {
    // Best effort cleanup
  }

  try {
    globalShortcut.register(accelerator, () => {
      toggleWindow();
    });
    currentAccelerator = accelerator;

    // Verify the registration actually took effect
    if (!globalShortcut.isRegistered(accelerator)) {
      throw new Error(`Failed to register ${accelerator}`);
    }

    return true;
  } catch {
    // If new shortcut fails, try to restore the previous one
    try {
      globalShortcut.register(previous, () => {
        toggleWindow();
      });
      currentAccelerator = previous;
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
