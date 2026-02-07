import { create } from 'zustand';

interface SettingsStore {
  theme: 'dark' | 'light';

  fontSize: number;
  fontFamily: string;
  terminalShell: string;
  setTheme: (theme: 'dark' | 'light') => void;

  setFontSize: (size: number) => void;
  setFontFamily: (family: string) => void;
  setTerminalShell: (shell: string) => void;
  loadFromDb: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  theme: 'dark',

  fontSize: 14,
  fontFamily: 'monospace',
  terminalShell: 'auto',
  setTheme: (theme) => {
    set({ theme });
    window.api?.db.setSetting('theme', theme);
  },

  setFontSize: (fontSize) => {
    set({ fontSize });
    window.api?.db.setSetting('font_size', String(fontSize));
  },
  setFontFamily: (fontFamily) => {
    set({ fontFamily });
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
    set({
      theme: (theme as 'dark' | 'light') ?? 'dark',
      fontSize: fontSize ? Number(fontSize) : 14,
      fontFamily: fontFamily ?? 'monospace',
      terminalShell: terminalShell ?? 'auto',
    });
  },
}));
