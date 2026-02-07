import * as pty from 'node-pty';
import { BrowserWindow } from 'electron';
import os from 'os';

interface TerminalProcess {
  id: string;
  ptyProcess: pty.IPty;
  cwd: string;
}

export class TerminalManager {
  private terminals = new Map<string, TerminalProcess>();

  getDefaultShell(): string {
    if (process.platform === 'win32') {
      return process.env.COMSPEC || 'cmd.exe';
    }
    return process.env.SHELL || '/bin/bash';
  }

  create(id: string, cwd?: string, webContents?: Electron.WebContents): string {
    const shell = this.getDefaultShell();
    const initialCwd = cwd || os.homedir();

    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: initialCwd,
      env: {
        ...process.env,
        TERM: 'xterm-256color',
        COLORTERM: 'truecolor',
      } as Record<string, string>,
    });

    const terminal: TerminalProcess = {
      id,
      ptyProcess,
      cwd: initialCwd,
    };

    this.terminals.set(id, terminal);

    // Forward pty output to renderer
    ptyProcess.onData((data) => {
      if (webContents && !webContents.isDestroyed()) {
        webContents.send('terminal:data', id, data);
      }
    });

    ptyProcess.onExit(({ exitCode }) => {
      if (webContents && !webContents.isDestroyed()) {
        webContents.send('terminal:exit', id, exitCode);
      }
      this.terminals.delete(id);
    });

    return id;
  }

  write(id: string, data: string): void {
    const terminal = this.terminals.get(id);
    if (terminal) {
      terminal.ptyProcess.write(data);
    }
  }

  resize(id: string, cols: number, rows: number): void {
    const terminal = this.terminals.get(id);
    if (terminal) {
      terminal.ptyProcess.resize(cols, rows);
    }
  }

  dispose(id: string): void {
    const terminal = this.terminals.get(id);
    if (terminal) {
      terminal.ptyProcess.kill();
      this.terminals.delete(id);
    }
  }

  disposeAll(): void {
    for (const [id] of this.terminals) {
      this.dispose(id);
    }
  }

  getTitle(id: string): string {
    const terminal = this.terminals.get(id);
    if (terminal) {
      return terminal.ptyProcess.process || 'Terminal';
    }
    return 'Terminal';
  }
}
