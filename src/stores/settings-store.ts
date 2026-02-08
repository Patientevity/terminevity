import { create } from 'zustand';

export type Theme = 'dark' | 'light' | 'system' | 'custom';

function getSystemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// CSS variable names that may be overridden by custom themes
const CUSTOM_CSS_VARS = [
  '--background', '--foreground',
  '--card', '--card-foreground',
  '--popover', '--popover-foreground',
  '--primary', '--primary-foreground',
  '--secondary', '--secondary-foreground',
  '--muted', '--muted-foreground',
  '--accent', '--accent-foreground',
  '--destructive', '--destructive-foreground',
  '--border', '--input', '--ring',
];

function clearCustomCssVars() {
  const root = document.documentElement;
  for (const v of CUSTOM_CSS_VARS) {
    root.style.removeProperty(v);
  }
}

function applyThemeToDOM(theme: Theme) {
  if (theme === 'custom') return; // custom mode is handled by theme-store
  clearCustomCssVars();
  const isDark = theme === 'system' ? getSystemDark() : theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
}

function applyFontToDOM(fontSize: number, fontFamily: string) {
  document.documentElement.style.fontSize = `${fontSize}px`;
  document.documentElement.style.fontFamily = fontFamily;
}

interface SettingsStore {
  theme: Theme;
  fontSize: number;
  fontFamily: string;
  terminalShell: string;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: string) => void;
  setTerminalShell: (shell: string) => void;
  loadFromDb: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  theme: 'system',
  fontSize: 14,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  terminalShell: 'auto',

  setTheme: (theme) => {
    set({ theme });
    applyThemeToDOM(theme);
    window.api?.db.setSetting('theme', theme);
  },

  setFontSize: (fontSize) => {
    set({ fontSize });
    const { fontFamily } = useSettingsStore.getState();
    applyFontToDOM(fontSize, fontFamily);
    window.api?.db.setSetting('font_size', String(fontSize));
  },

  setFontFamily: (fontFamily) => {
    set({ fontFamily });
    const { fontSize } = useSettingsStore.getState();
    applyFontToDOM(fontSize, fontFamily);
    window.api?.db.setSetting('font_family', fontFamily);
  },

  setTerminalShell: (terminalShell) => {
    set({ terminalShell });
    window.api?.db.setSetting('terminal_shell', terminalShell);
  },

  loadFromDb: async () => {
    if (!window.api?.db) return;
    const [theme, fontSize, fontFamily, terminalShell] = await Promise.all([
      window.api.db.getSetting('theme'),
      window.api.db.getSetting('font_size'),
      window.api.db.getSetting('font_family'),
      window.api.db.getSetting('terminal_shell'),
    ]);

    const resolvedTheme = (theme as Theme) ?? 'system';
    const resolvedFontSize = fontSize ? Number(fontSize) : 14;
    const resolvedFontFamily = fontFamily ?? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    set({
      theme: resolvedTheme,
      fontSize: resolvedFontSize,
      fontFamily: resolvedFontFamily,
      terminalShell: terminalShell ?? 'auto',
    });

    // Apply to DOM after loading (custom is handled by theme-store's loadFromDb)
    applyThemeToDOM(resolvedTheme);
    applyFontToDOM(resolvedFontSize, resolvedFontFamily);

    // Listen for OS theme changes when set to 'system'
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', () => {
      const current = useSettingsStore.getState().theme;
      if (current === 'system') {
        applyThemeToDOM('system');
      }
    });
  },
}));
