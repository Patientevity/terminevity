import type { KeyCombo, HotkeyBindingsMap, HotkeyActionId } from '@/types/hotkeys';

const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');

const MODIFIER_KEYS = new Set(['Control', 'Shift', 'Alt', 'Meta']);

export function keyboardEventToBinding(e: KeyboardEvent): KeyCombo | null {
  if (MODIFIER_KEYS.has(e.key)) return null;

  return {
    key: normalizeKey(e.key),
    ctrl: e.ctrlKey,
    shift: e.shiftKey,
    alt: e.altKey,
    meta: e.metaKey,
  };
}

function normalizeKey(key: string): string {
  if (key.length === 1) return key.toLowerCase();
  return key;
}

export function comboEquals(a: KeyCombo, b: KeyCombo): boolean {
  return (
    a.key === b.key &&
    a.shift === b.shift &&
    a.alt === b.alt &&
    normalizeModifier(a) === normalizeModifier(b)
  );
}

function normalizeModifier(combo: KeyCombo): boolean {
  if (isMac) return combo.ctrl || combo.meta;
  return combo.ctrl;
}

export function matchesBinding(e: KeyboardEvent, binding: KeyCombo): boolean {
  const eventKey = normalizeKey(e.key);
  if (eventKey !== binding.key) return false;
  if (e.shiftKey !== binding.shift) return false;
  if (e.altKey !== binding.alt) return false;

  const eventMod = isMac ? (e.ctrlKey || e.metaKey) : e.ctrlKey;
  const bindingMod = isMac ? (binding.ctrl || binding.meta) : binding.ctrl;
  if (eventMod !== bindingMod) return false;

  return true;
}

export function formatBindingForDisplay(combo: KeyCombo): string {
  const parts: string[] = [];

  if (combo.ctrl || combo.meta) {
    parts.push(isMac ? '\u2318' : 'Ctrl');
  }
  if (combo.shift) {
    parts.push(isMac ? '\u21E7' : 'Shift');
  }
  if (combo.alt) {
    parts.push(isMac ? '\u2325' : 'Alt');
  }

  parts.push(formatKey(combo.key));
  return parts.join(isMac ? '' : '+');
}

function formatKey(key: string): string {
  const keyMap: Record<string, string> = {
    'ArrowUp': isMac ? '\u2191' : 'Up',
    'ArrowDown': isMac ? '\u2193' : 'Down',
    'ArrowLeft': isMac ? '\u2190' : 'Left',
    'ArrowRight': isMac ? '\u2192' : 'Right',
    'Tab': isMac ? '\u21E5' : 'Tab',
    'Enter': isMac ? '\u21A9' : 'Enter',
    'Backspace': isMac ? '\u232B' : 'Backspace',
    'Delete': isMac ? '\u2326' : 'Delete',
    'Escape': isMac ? '\u238B' : 'Esc',
    ' ': 'Space',
  };
  if (keyMap[key]) return keyMap[key];
  if (key.length === 1) return key.toUpperCase();
  return key;
}

export function findConflict(
  bindings: HotkeyBindingsMap,
  newCombo: KeyCombo,
  excludeActionId: HotkeyActionId,
): HotkeyActionId | null {
  for (const [actionId, existing] of Object.entries(bindings)) {
    if (actionId === excludeActionId) continue;
    if (comboEquals(existing, newCombo)) {
      return actionId as HotkeyActionId;
    }
  }
  return null;
}

export function comboToElectronAccelerator(combo: KeyCombo): string {
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

export function hasModifier(e: KeyboardEvent): boolean {
  return e.ctrlKey || e.altKey || e.metaKey;
}

export function serializeBindings(bindings: HotkeyBindingsMap): string {
  return JSON.stringify(bindings);
}

export function deserializeBindings(json: string): Partial<HotkeyBindingsMap> | null {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
