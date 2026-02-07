import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { createWindow, getMainWindow } from './window';
import { registerGlobalShortcuts } from './globalShortcut';
import { createTray } from './tray';
import { registerIpcHandlers } from './ipc-handlers';
import { initDatabase } from './database';
import { TerminalManager } from './terminal-manager';

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = getMainWindow();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}

// Initialize globals
let terminalManager: TerminalManager;

app.whenReady().then(async () => {
  // Init database
  const db = initDatabase();

  // Create terminal manager
  terminalManager = new TerminalManager();

  // Create main window
  const win = createWindow();

  // Register IPC handlers
  registerIpcHandlers(db, terminalManager);

  // Register global shortcuts
  registerGlobalShortcuts();

  // Create system tray
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (terminalManager) {
    terminalManager.disposeAll();
  }
});
