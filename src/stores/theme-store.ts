import { create } from 'zustand';
import { useSettingsStore } from './settings-store';

export interface TerminalTheme {
  name: string;
  background: string;
  foreground: string;
  cursor: string;
  cursorAccent: string;
  selectionBackground: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
  terminalFontSize: number;
  terminalFontFamily: string;
}

// ── Preset Themes ──────────────────────────────────────────────────────

const DEFAULT_FONT_SIZE = 14;
const DEFAULT_FONT_FAMILY = '"JetBrains Mono", monospace';

function makeTheme(
  name: string,
  colors: Omit<TerminalTheme, 'name' | 'terminalFontSize' | 'terminalFontFamily'>,
): TerminalTheme {
  return { name, ...colors, terminalFontSize: DEFAULT_FONT_SIZE, terminalFontFamily: DEFAULT_FONT_FAMILY };
}

export const PRESET_THEMES: TerminalTheme[] = [
  // ── Dark themes ──
  makeTheme('Default Dark', {
    background: '#09090b', foreground: '#fafafa', cursor: '#fafafa', cursorAccent: '#09090b',
    selectionBackground: '#27272a',
    black: '#09090b', red: '#ef4444', green: '#22c55e', yellow: '#eab308',
    blue: '#3b82f6', magenta: '#a855f7', cyan: '#06b6d4', white: '#fafafa',
    brightBlack: '#71717a', brightRed: '#f87171', brightGreen: '#4ade80', brightYellow: '#facc15',
    brightBlue: '#60a5fa', brightMagenta: '#c084fc', brightCyan: '#22d3ee', brightWhite: '#ffffff',
  }),
  makeTheme('Dracula', {
    background: '#282a36', foreground: '#f8f8f2', cursor: '#f8f8f2', cursorAccent: '#282a36',
    selectionBackground: '#44475a',
    black: '#21222c', red: '#ff5555', green: '#50fa7b', yellow: '#f1fa8c',
    blue: '#bd93f9', magenta: '#ff79c6', cyan: '#8be9fd', white: '#f8f8f2',
    brightBlack: '#6272a4', brightRed: '#ff6e6e', brightGreen: '#69ff94', brightYellow: '#ffffa5',
    brightBlue: '#d6acff', brightMagenta: '#ff92df', brightCyan: '#a4ffff', brightWhite: '#ffffff',
  }),
  makeTheme('One Dark', {
    background: '#282c34', foreground: '#abb2bf', cursor: '#528bff', cursorAccent: '#282c34',
    selectionBackground: '#3e4451',
    black: '#282c34', red: '#e06c75', green: '#98c379', yellow: '#e5c07b',
    blue: '#61afef', magenta: '#c678dd', cyan: '#56b6c2', white: '#abb2bf',
    brightBlack: '#5c6370', brightRed: '#e06c75', brightGreen: '#98c379', brightYellow: '#e5c07b',
    brightBlue: '#61afef', brightMagenta: '#c678dd', brightCyan: '#56b6c2', brightWhite: '#ffffff',
  }),
  makeTheme('Tokyo Night', {
    background: '#1a1b26', foreground: '#a9b1d6', cursor: '#c0caf5', cursorAccent: '#1a1b26',
    selectionBackground: '#33467c',
    black: '#15161e', red: '#f7768e', green: '#9ece6a', yellow: '#e0af68',
    blue: '#7aa2f7', magenta: '#bb9af7', cyan: '#7dcfff', white: '#a9b1d6',
    brightBlack: '#414868', brightRed: '#f7768e', brightGreen: '#9ece6a', brightYellow: '#e0af68',
    brightBlue: '#7aa2f7', brightMagenta: '#bb9af7', brightCyan: '#7dcfff', brightWhite: '#c0caf5',
  }),
  makeTheme('Nord', {
    background: '#2e3440', foreground: '#d8dee9', cursor: '#d8dee9', cursorAccent: '#2e3440',
    selectionBackground: '#434c5e',
    black: '#3b4252', red: '#bf616a', green: '#a3be8c', yellow: '#ebcb8b',
    blue: '#81a1c1', magenta: '#b48ead', cyan: '#88c0d0', white: '#e5e9f0',
    brightBlack: '#4c566a', brightRed: '#bf616a', brightGreen: '#a3be8c', brightYellow: '#ebcb8b',
    brightBlue: '#81a1c1', brightMagenta: '#b48ead', brightCyan: '#8fbcbb', brightWhite: '#eceff4',
  }),
  makeTheme('Monokai', {
    background: '#272822', foreground: '#f8f8f2', cursor: '#f8f8f0', cursorAccent: '#272822',
    selectionBackground: '#49483e',
    black: '#272822', red: '#f92672', green: '#a6e22e', yellow: '#f4bf75',
    blue: '#66d9ef', magenta: '#ae81ff', cyan: '#a1efe4', white: '#f8f8f2',
    brightBlack: '#75715e', brightRed: '#f92672', brightGreen: '#a6e22e', brightYellow: '#f4bf75',
    brightBlue: '#66d9ef', brightMagenta: '#ae81ff', brightCyan: '#a1efe4', brightWhite: '#f9f8f5',
  }),
  makeTheme('Catppuccin Mocha', {
    background: '#1e1e2e', foreground: '#cdd6f4', cursor: '#f5e0dc', cursorAccent: '#1e1e2e',
    selectionBackground: '#45475a',
    black: '#45475a', red: '#f38ba8', green: '#a6e3a1', yellow: '#f9e2af',
    blue: '#89b4fa', magenta: '#f5c2e7', cyan: '#94e2d5', white: '#bac2de',
    brightBlack: '#585b70', brightRed: '#f38ba8', brightGreen: '#a6e3a1', brightYellow: '#f9e2af',
    brightBlue: '#89b4fa', brightMagenta: '#f5c2e7', brightCyan: '#94e2d5', brightWhite: '#a6adc8',
  }),
  makeTheme('Solarized Dark', {
    background: '#002b36', foreground: '#839496', cursor: '#839496', cursorAccent: '#002b36',
    selectionBackground: '#073642',
    black: '#073642', red: '#dc322f', green: '#859900', yellow: '#b58900',
    blue: '#268bd2', magenta: '#d33682', cyan: '#2aa198', white: '#eee8d5',
    brightBlack: '#586e75', brightRed: '#cb4b16', brightGreen: '#586e75', brightYellow: '#657b83',
    brightBlue: '#839496', brightMagenta: '#6c71c4', brightCyan: '#93a1a1', brightWhite: '#fdf6e3',
  }),
  makeTheme('Gruvbox Dark', {
    background: '#282828', foreground: '#ebdbb2', cursor: '#ebdbb2', cursorAccent: '#282828',
    selectionBackground: '#3c3836',
    black: '#282828', red: '#cc241d', green: '#98971a', yellow: '#d79921',
    blue: '#458588', magenta: '#b16286', cyan: '#689d6a', white: '#a89984',
    brightBlack: '#928374', brightRed: '#fb4934', brightGreen: '#b8bb26', brightYellow: '#fabd2f',
    brightBlue: '#83a598', brightMagenta: '#d3869b', brightCyan: '#8ec07c', brightWhite: '#ebdbb2',
  }),

  // ── Light themes ──
  makeTheme('Default Light', {
    background: '#ffffff', foreground: '#1e1e1e', cursor: '#1e1e1e', cursorAccent: '#ffffff',
    selectionBackground: '#add6ff',
    black: '#1e1e1e', red: '#cd3131', green: '#008000', yellow: '#949800',
    blue: '#0451a5', magenta: '#bc05bc', cyan: '#0598bc', white: '#e5e5e5',
    brightBlack: '#666666', brightRed: '#cd3131', brightGreen: '#14ce14', brightYellow: '#b5ba00',
    brightBlue: '#0451a5', brightMagenta: '#bc05bc', brightCyan: '#0598bc', brightWhite: '#a5a5a5',
  }),
  makeTheme('Solarized Light', {
    background: '#fdf6e3', foreground: '#657b83', cursor: '#657b83', cursorAccent: '#fdf6e3',
    selectionBackground: '#eee8d5',
    black: '#073642', red: '#dc322f', green: '#859900', yellow: '#b58900',
    blue: '#268bd2', magenta: '#d33682', cyan: '#2aa198', white: '#eee8d5',
    brightBlack: '#586e75', brightRed: '#cb4b16', brightGreen: '#586e75', brightYellow: '#657b83',
    brightBlue: '#839496', brightMagenta: '#6c71c4', brightCyan: '#93a1a1', brightWhite: '#fdf6e3',
  }),
  makeTheme('GitHub Light', {
    background: '#ffffff', foreground: '#24292e', cursor: '#044289', cursorAccent: '#ffffff',
    selectionBackground: '#c8c8fa',
    black: '#24292e', red: '#d73a49', green: '#22863a', yellow: '#b08800',
    blue: '#0366d6', magenta: '#6f42c1', cyan: '#1b7c83', white: '#6a737d',
    brightBlack: '#959da5', brightRed: '#cb2431', brightGreen: '#28a745', brightYellow: '#dbab09',
    brightBlue: '#2188ff', brightMagenta: '#8a63d2', brightCyan: '#3192aa', brightWhite: '#d1d5da',
  }),
  makeTheme('Catppuccin Latte', {
    background: '#eff1f5', foreground: '#4c4f69', cursor: '#dc8a78', cursorAccent: '#eff1f5',
    selectionBackground: '#ccd0da',
    black: '#5c5f77', red: '#d20f39', green: '#40a02b', yellow: '#df8e1d',
    blue: '#1e66f5', magenta: '#ea76cb', cyan: '#179299', white: '#acb0be',
    brightBlack: '#6c6f85', brightRed: '#d20f39', brightGreen: '#40a02b', brightYellow: '#df8e1d',
    brightBlue: '#1e66f5', brightMagenta: '#ea76cb', brightCyan: '#179299', brightWhite: '#bcc0cc',
  }),
  makeTheme('One Light', {
    background: '#fafafa', foreground: '#383a42', cursor: '#526fff', cursorAccent: '#fafafa',
    selectionBackground: '#e5e5e6',
    black: '#383a42', red: '#e45649', green: '#50a14f', yellow: '#c18401',
    blue: '#4078f2', magenta: '#a626a4', cyan: '#0184bc', white: '#a0a1a7',
    brightBlack: '#4f525e', brightRed: '#e06c75', brightGreen: '#98c379', brightYellow: '#e5c07b',
    brightBlue: '#61afef', brightMagenta: '#c678dd', brightCyan: '#56b6c2', brightWhite: '#ffffff',
  }),
  makeTheme('Gruvbox Light', {
    background: '#fbf1c7', foreground: '#3c3836', cursor: '#3c3836', cursorAccent: '#fbf1c7',
    selectionBackground: '#ebdbb2',
    black: '#3c3836', red: '#cc241d', green: '#98971a', yellow: '#d79921',
    blue: '#458588', magenta: '#b16286', cyan: '#689d6a', white: '#7c6f64',
    brightBlack: '#928374', brightRed: '#9d0006', brightGreen: '#79740e', brightYellow: '#b57614',
    brightBlue: '#076678', brightMagenta: '#8f3f71', brightCyan: '#427b58', brightWhite: '#3c3836',
  }),
];

// ── Color keys for iteration ───────────────────────────────────────────

export type TerminalColorKey = Exclude<keyof TerminalTheme, 'name' | 'terminalFontSize' | 'terminalFontFamily'>;

export const TERMINAL_COLOR_KEYS: { key: TerminalColorKey; label: string }[] = [
  { key: 'background', label: 'Background' },
  { key: 'foreground', label: 'Foreground' },
  { key: 'cursor', label: 'Cursor' },
  { key: 'cursorAccent', label: 'Cursor Accent' },
  { key: 'selectionBackground', label: 'Selection' },
];

export const ANSI_COLOR_KEYS: { key: TerminalColorKey; label: string }[] = [
  { key: 'black', label: 'Black' },
  { key: 'red', label: 'Red' },
  { key: 'green', label: 'Green' },
  { key: 'yellow', label: 'Yellow' },
  { key: 'blue', label: 'Blue' },
  { key: 'magenta', label: 'Magenta' },
  { key: 'cyan', label: 'Cyan' },
  { key: 'white', label: 'White' },
];

export const BRIGHT_COLOR_KEYS: { key: TerminalColorKey; label: string }[] = [
  { key: 'brightBlack', label: 'Bright Black' },
  { key: 'brightRed', label: 'Bright Red' },
  { key: 'brightGreen', label: 'Bright Green' },
  { key: 'brightYellow', label: 'Bright Yellow' },
  { key: 'brightBlue', label: 'Bright Blue' },
  { key: 'brightMagenta', label: 'Bright Magenta' },
  { key: 'brightCyan', label: 'Bright Cyan' },
  { key: 'brightWhite', label: 'Bright White' },
];

// ── Hex → HSL conversion & app CSS variable application ────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100 * 10) / 10, Math.round(l * 100 * 10) / 10];
}

function hexToHslStr(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  return `${h} ${s}% ${l}%`;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/** Apply the terminal theme's colors as CSS variables to style the entire app. */
export function applyThemeToApp(theme: TerminalTheme) {
  const root = document.documentElement;
  const [r, g, b] = hexToRgb(theme.background);
  const [bgH, bgS, bgL] = rgbToHsl(r, g, b);
  const isDark = bgL < 50;

  // Toggle .dark class for Tailwind
  root.classList.toggle('dark', isDark);

  const bgStr = hexToHslStr(theme.background);
  const fgStr = hexToHslStr(theme.foreground);

  // Compute muted/secondary: shift lightness towards center
  const mutedL = isDark ? clamp(bgL + 12, 0, 100) : clamp(bgL - 5, 0, 100);
  const mutedStr = `${bgH} ${clamp(bgS, 3, 100)}% ${mutedL}%`;

  // Muted foreground: dimmer version of foreground
  const [fgR, fgG, fgB] = hexToRgb(theme.foreground);
  const [fgH, fgS] = rgbToHsl(fgR, fgG, fgB);
  const mutedFgL = isDark ? 65 : 46;
  const mutedFgStr = `${fgH} ${clamp(fgS, 0, 10)}% ${mutedFgL}%`;

  // Border: slightly more visible than muted
  const borderL = isDark ? clamp(bgL + 14, 0, 100) : clamp(bgL - 8, 0, 100);
  const borderStr = `${bgH} ${clamp(bgS, 3, 100)}% ${borderL}%`;

  root.style.setProperty('--background', bgStr);
  root.style.setProperty('--foreground', fgStr);
  root.style.setProperty('--card', bgStr);
  root.style.setProperty('--card-foreground', fgStr);
  root.style.setProperty('--popover', bgStr);
  root.style.setProperty('--popover-foreground', fgStr);
  root.style.setProperty('--primary', fgStr);
  root.style.setProperty('--primary-foreground', bgStr);
  root.style.setProperty('--secondary', mutedStr);
  root.style.setProperty('--secondary-foreground', fgStr);
  root.style.setProperty('--muted', mutedStr);
  root.style.setProperty('--muted-foreground', mutedFgStr);
  root.style.setProperty('--accent', mutedStr);
  root.style.setProperty('--accent-foreground', fgStr);
  root.style.setProperty('--border', borderStr);
  root.style.setProperty('--input', borderStr);
  root.style.setProperty('--ring', fgStr);

  // Destructive stays theme-appropriate
  if (isDark) {
    root.style.setProperty('--destructive', '0 62.8% 30.6%');
    root.style.setProperty('--destructive-foreground', fgStr);
  } else {
    root.style.setProperty('--destructive', '0 84.2% 60.2%');
    root.style.setProperty('--destructive-foreground', '0 0% 98%');
  }
}

// ── Store ──────────────────────────────────────────────────────────────

interface ThemeStore {
  activeThemeName: string;
  terminalTheme: TerminalTheme;
  setPresetTheme: (name: string) => void;
  setCustomColor: (key: TerminalColorKey, value: string) => void;
  setTerminalFontSize: (size: number) => void;
  setTerminalFontFamily: (family: string) => void;
  resetToPreset: () => void;
  loadFromDb: () => Promise<void>;
}

const DEFAULT_THEME = PRESET_THEMES[0]; // Default Dark

function persistTheme(theme: TerminalTheme) {
  window.api?.db.setSetting('terminal_theme', JSON.stringify(theme));
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  activeThemeName: DEFAULT_THEME.name,
  terminalTheme: { ...DEFAULT_THEME },

  setPresetTheme: (name) => {
    const preset = PRESET_THEMES.find((t) => t.name === name);
    if (!preset) return;
    const theme = { ...preset, terminalFontSize: get().terminalTheme.terminalFontSize, terminalFontFamily: get().terminalTheme.terminalFontFamily };
    set({ activeThemeName: name, terminalTheme: theme });
    persistTheme(theme);
    // Apply to entire app and set settings theme to "custom"
    applyThemeToApp(theme);
    useSettingsStore.getState().setTheme('custom');
  },

  setCustomColor: (key, value) => {
    const current = get().terminalTheme;
    const updated = { ...current, [key]: value, name: 'Custom' };
    set({ activeThemeName: 'Custom', terminalTheme: updated });
    persistTheme(updated);
    applyThemeToApp(updated);
    if (useSettingsStore.getState().theme !== 'custom') {
      useSettingsStore.getState().setTheme('custom');
    }
  },

  setTerminalFontSize: (size) => {
    const updated = { ...get().terminalTheme, terminalFontSize: size };
    set({ terminalTheme: updated });
    persistTheme(updated);
  },

  setTerminalFontFamily: (family) => {
    const updated = { ...get().terminalTheme, terminalFontFamily: family };
    set({ terminalTheme: updated });
    persistTheme(updated);
  },

  resetToPreset: () => {
    const { activeThemeName, terminalTheme } = get();
    const preset = PRESET_THEMES.find((t) => t.name === activeThemeName);
    if (preset) {
      const theme = { ...preset, terminalFontSize: terminalTheme.terminalFontSize, terminalFontFamily: terminalTheme.terminalFontFamily };
      set({ terminalTheme: theme });
      persistTheme(theme);
      applyThemeToApp(theme);
    } else {
      // If "Custom", reset to Default Dark
      const theme = { ...DEFAULT_THEME, terminalFontSize: terminalTheme.terminalFontSize, terminalFontFamily: terminalTheme.terminalFontFamily };
      set({ activeThemeName: DEFAULT_THEME.name, terminalTheme: theme });
      persistTheme(theme);
      applyThemeToApp(theme);
    }
  },

  loadFromDb: async () => {
    if (!window.api?.db) return;
    const raw = await window.api.db.getSetting('terminal_theme');
    if (!raw) return; // Use default

    try {
      const parsed = JSON.parse(raw) as TerminalTheme;
      const name = parsed.name ?? 'Custom';
      set({ activeThemeName: name, terminalTheme: parsed });
      // If settings theme is "custom", apply the saved theme colors to the app
      if (useSettingsStore.getState().theme === 'custom') {
        applyThemeToApp(parsed);
      }
    } catch {
      // Invalid JSON, keep defaults
    }
  },
}));
