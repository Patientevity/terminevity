import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { SearchAddon } from '@xterm/addon-search';
import { api } from '@/lib/ipc';
import { useThemeStore, type TerminalTheme } from '@/stores/theme-store';

interface UseTerminalOptions {
  id: string;
}

function themeToXterm(t: TerminalTheme) {
  return {
    background: t.background,
    foreground: t.foreground,
    cursor: t.cursor,
    cursorAccent: t.cursorAccent,
    selectionBackground: t.selectionBackground,
    black: t.black,
    red: t.red,
    green: t.green,
    yellow: t.yellow,
    blue: t.blue,
    magenta: t.magenta,
    cyan: t.cyan,
    white: t.white,
    brightBlack: t.brightBlack,
    brightRed: t.brightRed,
    brightGreen: t.brightGreen,
    brightYellow: t.brightYellow,
    brightBlue: t.brightBlue,
    brightMagenta: t.brightMagenta,
    brightCyan: t.brightCyan,
    brightWhite: t.brightWhite,
  };
}

export function useTerminal({ id }: UseTerminalOptions) {
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInitialized = useRef(false);

  const init = useCallback(async (container: HTMLDivElement) => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    containerRef.current = container;

    const { terminalTheme } = useThemeStore.getState();

    const terminal = new Terminal({
      fontSize: terminalTheme.terminalFontSize,
      fontFamily: terminalTheme.terminalFontFamily,
      theme: themeToXterm(terminalTheme),
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
  }, [id]);

  // Subscribe to theme store for live updates
  useEffect(() => {
    const unsubscribe = useThemeStore.subscribe((state, prevState) => {
      const terminal = terminalRef.current;
      if (!terminal) return;

      const theme = state.terminalTheme;
      const prev = prevState.terminalTheme;

      if (theme !== prev) {
        terminal.options.theme = themeToXterm(theme);
        terminal.options.fontSize = theme.terminalFontSize;
        terminal.options.fontFamily = theme.terminalFontFamily;
        fitAddonRef.current?.fit();
      }
    });

    return unsubscribe;
  }, []);

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
