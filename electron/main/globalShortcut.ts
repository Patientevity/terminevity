import { globalShortcut } from 'electron';
import { toggleWindow } from './window';

export function registerGlobalShortcuts(): void {
  globalShortcut.register('F1', () => {
    toggleWindow();
  });
}

export function unregisterGlobalShortcuts(): void {
  globalShortcut.unregisterAll();
}
