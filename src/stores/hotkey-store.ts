import { create } from 'zustand';
import type { HotkeyActionId, HotkeyBindingsMap, KeyCombo } from '@/types/hotkeys';
import { getDefaultBindings, getDefaultBinding } from '@/lib/hotkey-defaults';
import {
  findConflict,
  serializeBindings,
  deserializeBindings,
  comboToElectronAccelerator,
} from '@/lib/hotkey-utils';

interface HotkeyStore {
  bindings: HotkeyBindingsMap;
  loadFromDb: () => Promise<void>;
  setBinding: (
    actionId: HotkeyActionId,
    combo: KeyCombo,
  ) => { success: boolean; conflictWith?: HotkeyActionId };
  resetBinding: (actionId: HotkeyActionId) => void;
  resetAllBindings: () => void;
}

function persist(bindings: HotkeyBindingsMap): void {
  window.api?.db.setSetting('hotkey_bindings', serializeBindings(bindings));
}

function syncGlobalShortcut(bindings: HotkeyBindingsMap): void {
  const toggleCombo = bindings['toggle-window'];
  if (toggleCombo) {
    const accelerator = comboToElectronAccelerator(toggleCombo);
    window.api?.hotkey?.setGlobal(accelerator);
  }
}

export const useHotkeyStore = create<HotkeyStore>((set, get) => ({
  bindings: getDefaultBindings(),

  loadFromDb: async () => {
    if (!window.api?.db) return;
    const json = await window.api.db.getSetting('hotkey_bindings');
    if (json) {
      const stored = deserializeBindings(json);
      if (stored) {
        const merged: HotkeyBindingsMap = { ...getDefaultBindings(), ...stored } as HotkeyBindingsMap;
        set({ bindings: merged });
        return;
      }
    }
    // Also migrate the old 'hotkey' setting if it exists
    const legacyHotkey = await window.api.db.getSetting('hotkey');
    if (legacyHotkey && legacyHotkey !== 'F1') {
      const defaults = getDefaultBindings();
      defaults['toggle-window'] = { key: legacyHotkey, ctrl: false, shift: false, alt: false, meta: false };
      set({ bindings: defaults });
      persist(defaults);
    }
  },

  setBinding: (actionId, combo) => {
    const { bindings } = get();
    const conflict = findConflict(bindings, combo, actionId);
    if (conflict) {
      return { success: false, conflictWith: conflict };
    }
    const newBindings = { ...bindings, [actionId]: combo };
    set({ bindings: newBindings });
    persist(newBindings);
    if (actionId === 'toggle-window') {
      syncGlobalShortcut(newBindings);
    }
    return { success: true };
  },

  resetBinding: (actionId) => {
    const { bindings } = get();
    const defaultCombo = getDefaultBinding(actionId);
    const newBindings = { ...bindings, [actionId]: defaultCombo };
    set({ bindings: newBindings });
    persist(newBindings);
    if (actionId === 'toggle-window') {
      syncGlobalShortcut(newBindings);
    }
  },

  resetAllBindings: () => {
    const defaults = getDefaultBindings();
    set({ bindings: defaults });
    persist(defaults);
    syncGlobalShortcut(defaults);
  },
}));
