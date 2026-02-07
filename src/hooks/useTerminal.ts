import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { SearchAddon } from '@xterm/addon-search';
import { api } from '@/lib/ipc';

interface UseTerminalOptions {
  id: string;
  fontSize?: number;
  fontFamily?: string;
}

export function useTerminal({ id, fontSize = 14, fontFamily = 'monospace' }: UseTerminalOptions) {
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInitialized = useRef(false);

  const init = useCallback(async (container: HTMLDivElement) => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    containerRef.current = container;

    const terminal = new Terminal({
      fontSize,
      fontFamily,
      theme: {
        background: '#09090b',
        foreground: '#fafafa',
        cursor: '#fafafa',
        cursorAccent: '#09090b',
        selectionBackground: '#27272a',
        black: '#09090b',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#fafafa',
        brightBlack: '#71717a',
        brightRed: '#f87171',
        brightGreen: '#4ade80',
        brightYellow: '#facc15',
        brightBlue: '#60a5fa',
        brightMagenta: '#c084fc',
        brightCyan: '#22d3ee',
        brightWhite: '#ffffff',
      },
      cursorBlink: true,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    const searchAddon = new SearchAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);
    terminal.loadAddon(searchAddon);

    terminal.open(container);
    fitAddon.fit();

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Create the pty process
    await api.terminal.create(id);

    // Forward input to pty
    terminal.onData((data) => {
      api.terminal.input(id, data);
    });

    // Handle resize
    terminal.onResize(({ cols, rows }) => {
      api.terminal.resize(id, cols, rows);
    });

    // Initial resize
    const { cols, rows } = terminal;
    api.terminal.resize(id, cols, rows);
  }, [id, fontSize, fontFamily]);

  useEffect(() => {
    // Listen for data from pty
    const unsubData = api.terminal.onData((termId, data) => {
      if (termId === id && terminalRef.current) {
        terminalRef.current.write(data);
      }
    });

    const unsubExit = api.terminal.onExit((termId, exitCode) => {
      if (termId === id && terminalRef.current) {
        terminalRef.current.writeln(`\r\n[Process exited with code ${exitCode}]`);
      }
    });

    return () => {
      unsubData();
      unsubExit();
    };
  }, [id]);

  const fit = useCallback(() => {
    fitAddonRef.current?.fit();
  }, []);

  const focus = useCallback(() => {
    terminalRef.current?.focus();
  }, []);

  const dispose = useCallback(() => {
    terminalRef.current?.dispose();
    api.terminal.close(id);
    isInitialized.current = false;
  }, [id]);

  return { init, fit, focus, dispose, terminalRef, containerRef };
}
