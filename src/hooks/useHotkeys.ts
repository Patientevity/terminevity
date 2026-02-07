import { useEffect } from 'react';
import { useHotkeyStore } from '@/stores/hotkey-store';
import { useAppStore } from '@/stores/app-store';
import { useTerminalStore } from '@/stores/terminal-store';
import { useLayoutStore } from '@/stores/layout-store';
import { matchesBinding, hasModifier } from '@/lib/hotkey-utils';
import type { HotkeyActionId } from '@/types/hotkeys';
import { v4 as uuidv4 } from 'uuid';

function isEditableElement(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;
  return false;
}

function isXtermElement(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  return !!el.closest('.xterm');
}

export function useHotkeys() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Skip if only modifier keys are pressed
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

      // Skip bare keys (no modifier) in editable elements and xterm
      if (!hasModifier(e) && (isEditableElement(e.target) || isXtermElement(e.target))) {
        return;
      }

      const bindings = useHotkeyStore.getState().bindings;
      let matchedAction: HotkeyActionId | null = null;

      for (const [actionId, binding] of Object.entries(bindings)) {
        if (matchesBinding(e, binding)) {
          matchedAction = actionId as HotkeyActionId;
          break;
        }
      }

      if (!matchedAction) return;

      // Don't handle the global toggle-window from renderer -- that's handled by Electron main process
      if (matchedAction === 'toggle-window') return;

      e.preventDefault();
      e.stopPropagation();

      executeAction(matchedAction);
    }

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);
}

function executeAction(actionId: HotkeyActionId): void {
  const appStore = useAppStore.getState();
  const terminalStore = useTerminalStore.getState();
  const layoutStore = useLayoutStore.getState();

  switch (actionId) {
    // Terminal actions
    case 'new-terminal-tab': {
      const id = uuidv4();
      terminalStore.addTab({
        id,
        label: `Terminal ${terminalStore.tabs.length + 1}`,
        terminalId: id,
      });
      if (appStore.currentView !== 'terminal') {
        appStore.setCurrentView('terminal');
      }
      break;
    }
    case 'close-terminal-tab': {
      const { activeTabId, tabs } = terminalStore;
      if (activeTabId && tabs.length > 0) {
        window.api?.terminal.close(activeTabId);
        terminalStore.removeTab(activeTabId);
      }
      break;
    }
    case 'next-tab': {
      const { tabs, activeTabId, setActiveTab } = terminalStore;
      if (tabs.length <= 1) break;
      const idx = tabs.findIndex((t) => t.id === activeTabId);
      const nextIdx = (idx + 1) % tabs.length;
      setActiveTab(tabs[nextIdx].id);
      break;
    }
    case 'previous-tab': {
      const { tabs, activeTabId, setActiveTab } = terminalStore;
      if (tabs.length <= 1) break;
      const idx = tabs.findIndex((t) => t.id === activeTabId);
      const prevIdx = (idx - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[prevIdx].id);
      break;
    }

    // View switching
    case 'switch-to-terminal':
      appStore.setCurrentView('terminal');
      break;
    case 'switch-to-chat':
      appStore.setCurrentView('chat');
      break;
    case 'switch-to-markdown':
      appStore.setCurrentView('markdown');
      break;
    case 'switch-to-canvas':
      appStore.setCurrentView('canvas');
      break;
    case 'switch-to-explorer':
      appStore.setCurrentView('explorer');
      break;
    case 'switch-to-memory':
      appStore.setCurrentView('memory');
      break;
    case 'switch-to-research':
      appStore.setCurrentView('research');
      break;
    case 'open-settings':
      appStore.setCurrentView('settings');
      break;

    // Layout splits
    case 'split-pane-right':
      layoutStore.addPanel({ id: uuidv4(), type: 'terminal', size: 50 });
      layoutStore.setSplitDirection('horizontal');
      break;
    case 'split-pane-down':
      layoutStore.addPanel({ id: uuidv4(), type: 'terminal', size: 50 });
      layoutStore.setSplitDirection('vertical');
      break;
    case 'split-pane-left':
      layoutStore.addPanel({ id: uuidv4(), type: 'terminal', size: 50 });
      layoutStore.setSplitDirection('horizontal');
      break;
    case 'split-pane-up':
      layoutStore.addPanel({ id: uuidv4(), type: 'terminal', size: 50 });
      layoutStore.setSplitDirection('vertical');
      break;

    // App
    case 'toggle-sidebar':
      appStore.toggleSidebar();
      break;
    case 'command-palette':
      // Command palette not yet implemented - placeholder for future
      break;
  }
}
