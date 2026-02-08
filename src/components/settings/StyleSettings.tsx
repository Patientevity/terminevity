import React from 'react';
import { Monitor, Paintbrush } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/stores/settings-store';
import {
  useThemeStore,
  PRESET_THEMES,
  TERMINAL_COLOR_KEYS,
  ANSI_COLOR_KEYS,
  BRIGHT_COLOR_KEYS,
  type TerminalColorKey,
  type TerminalTheme,
} from '@/stores/theme-store';

// ── App Font Families ──────────────────────────────────────────────────

const APP_FONTS = [
  { value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', label: 'System Default' },
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: '"SF Pro Display", -apple-system, sans-serif', label: 'SF Pro Display' },
  { value: '"Helvetica Neue", Helvetica, sans-serif', label: 'Helvetica Neue' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: '"Segoe UI", sans-serif', label: 'Segoe UI' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: '"Open Sans", sans-serif', label: 'Open Sans' },
  { value: 'Lato, sans-serif', label: 'Lato' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: '"Noto Sans", sans-serif', label: 'Noto Sans' },
  { value: '"Source Sans 3", sans-serif', label: 'Source Sans 3' },
  { value: 'Ubuntu, sans-serif', label: 'Ubuntu' },
  { value: '"IBM Plex Sans", sans-serif', label: 'IBM Plex Sans' },
  { value: '"DM Sans", sans-serif', label: 'DM Sans' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Raleway, sans-serif', label: 'Raleway' },
  { value: '"Fira Sans", sans-serif', label: 'Fira Sans' },
  { value: 'monospace', label: 'Monospace (System)' },
  { value: '"JetBrains Mono", monospace', label: 'JetBrains Mono' },
  { value: '"Fira Code", monospace', label: 'Fira Code' },
  { value: '"Source Code Pro", monospace', label: 'Source Code Pro' },
  { value: '"IBM Plex Mono", monospace', label: 'IBM Plex Mono' },
  { value: '"Cascadia Code", monospace', label: 'Cascadia Code' },
  { value: '"Ubuntu Mono", monospace', label: 'Ubuntu Mono' },
  { value: '"Inconsolata", monospace', label: 'Inconsolata' },
  { value: '"Hack", monospace', label: 'Hack' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: '"Merriweather", serif', label: 'Merriweather' },
  { value: '"Playfair Display", serif', label: 'Playfair Display' },
];

// ── Terminal Font Families ─────────────────────────────────────────────

const TERMINAL_FONTS = [
  { value: '"JetBrains Mono", monospace', label: 'JetBrains Mono' },
  { value: 'monospace', label: 'Monospace (System)' },
  { value: '"Fira Code", monospace', label: 'Fira Code' },
  { value: '"Source Code Pro", monospace', label: 'Source Code Pro' },
  { value: '"IBM Plex Mono", monospace', label: 'IBM Plex Mono' },
  { value: '"Cascadia Code", monospace', label: 'Cascadia Code' },
  { value: '"Ubuntu Mono", monospace', label: 'Ubuntu Mono' },
  { value: '"Inconsolata", monospace', label: 'Inconsolata' },
  { value: '"Hack", monospace', label: 'Hack' },
  { value: '"Courier New", monospace', label: 'Courier New' },
];

// ── Color Field ────────────────────────────────────────────────────────

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs w-28 truncate text-muted-foreground">{label}</label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded border border-input cursor-pointer bg-transparent p-0.5"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 h-8 text-xs font-mono"
      />
    </div>
  );
}

// ── Theme Preview Card ─────────────────────────────────────────────────

function ThemeCard({
  theme,
  isActive,
  onClick,
}: {
  theme: TerminalTheme;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col rounded-lg border-2 overflow-hidden transition-all hover:scale-105 ${
        isActive ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-muted-foreground/40'
      }`}
    >
      <div
        className="px-2 pt-2 pb-1.5 text-left"
        style={{ backgroundColor: theme.background }}
      >
        <div className="flex gap-1 mb-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.red }} />
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.green }} />
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.yellow }} />
        </div>
        <div className="space-y-0.5">
          <div className="flex gap-1 text-[8px] font-mono leading-none">
            <span style={{ color: theme.green }}>$</span>
            <span style={{ color: theme.foreground }}>ls</span>
          </div>
          <div className="flex gap-1 text-[8px] font-mono leading-none">
            <span style={{ color: theme.blue }}>src/</span>
            <span style={{ color: theme.yellow }}>pkg</span>
          </div>
        </div>
      </div>
      <div className="px-2 py-1 text-[10px] font-medium truncate bg-muted/50 text-foreground">
        {theme.name}
      </div>
    </button>
  );
}

// ── Preview Panel ──────────────────────────────────────────────────────

function ThemePreview({ theme }: { theme: TerminalTheme }) {
  return (
    <pre
      className="rounded-lg p-4 text-xs font-mono overflow-hidden border border-border"
      style={{
        backgroundColor: theme.background,
        color: theme.foreground,
        fontFamily: theme.terminalFontFamily,
        fontSize: theme.terminalFontSize,
      }}
    >
      <span style={{ color: theme.green }}>user@host</span>
      <span style={{ color: theme.foreground }}>:</span>
      <span style={{ color: theme.blue }}>~/projects</span>
      <span style={{ color: theme.foreground }}>$ </span>
      <span style={{ color: theme.foreground }}>ls -la</span>
      {'\n'}
      <span style={{ color: theme.foreground }}>drwxr-xr-x  </span>
      <span style={{ color: theme.magenta }}>user  </span>
      <span style={{ color: theme.blue }}>projects/</span>
      {'\n'}
      <span style={{ color: theme.foreground }}>-rw-r--r--  </span>
      <span style={{ color: theme.magenta }}>user  </span>
      <span style={{ color: theme.foreground }}>README.md</span>
      {'\n'}
      <span style={{ color: theme.foreground }}>-rwxr-xr-x  </span>
      <span style={{ color: theme.magenta }}>user  </span>
      <span style={{ color: theme.green }}>build.sh</span>
      {'\n'}
      <span style={{ color: theme.red }}>error:</span>
      <span style={{ color: theme.foreground }}> file not found</span>
      {'\n'}
      <span style={{ color: theme.yellow }}>warning:</span>
      <span style={{ color: theme.foreground }}> deprecated API usage</span>
      {'\n'}
      <span style={{ color: theme.cyan }}>info:</span>
      <span style={{ color: theme.foreground }}> build complete in 2.3s</span>
      {'\n'}
      {'\n'}
      <span style={{ color: theme.brightBlack }}># Bright colors</span>
      {'\n'}
      <span style={{ color: theme.brightRed }}>bright-red </span>
      <span style={{ color: theme.brightGreen }}>bright-green </span>
      <span style={{ color: theme.brightYellow }}>bright-yellow </span>
      <span style={{ color: theme.brightBlue }}>bright-blue</span>
      {'\n'}
      <span style={{ color: theme.brightMagenta }}>bright-magenta </span>
      <span style={{ color: theme.brightCyan }}>bright-cyan </span>
      <span style={{ color: theme.brightWhite }}>bright-white</span>
      {'\n'}
      {'\n'}
      <span style={{ color: theme.green }}>user@host</span>
      <span style={{ color: theme.foreground }}>:</span>
      <span style={{ color: theme.blue }}>~/projects</span>
      <span style={{ color: theme.foreground }}>$ </span>
      <span
        style={{
          backgroundColor: theme.cursor,
          color: theme.cursorAccent,
        }}
      >
        {' '}
      </span>
    </pre>
  );
}

// ── Main Component ─────────────────────────────────────────────────────

export function StyleSettings() {
  const { theme, fontSize, fontFamily, setTheme, setFontSize, setFontFamily } = useSettingsStore();
  const {
    activeThemeName,
    terminalTheme,
    setPresetTheme,
    setCustomColor,
    setTerminalFontSize,
    setTerminalFontFamily,
    resetToPreset,
  } = useThemeStore();

  return (
    <div className="space-y-8">
      {/* App Theme */}
      <section>
        <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
          App Theme
        </h4>
        <div className="flex gap-2">
          <Button
            variant={theme === 'system' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('system')}
            className="gap-1.5"
          >
            <Monitor className="w-3.5 h-3.5" />
            System
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('dark')}
          >
            Dark
          </Button>
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('light')}
          >
            Light
          </Button>
          <Button
            variant={theme === 'custom' ? 'default' : 'outline'}
            size="sm"
            disabled={theme === 'custom'}
            className="gap-1.5"
          >
            <Paintbrush className="w-3.5 h-3.5" />
            Custom
          </Button>
        </div>
        {theme === 'custom' && (
          <p className="text-xs text-muted-foreground mt-2">
            Custom theme active — controlled by preset selection below. Pick System, Dark, or Light to revert.
          </p>
        )}
      </section>

      {/* App Font */}
      <section>
        <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
          App Font
        </h4>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-xs text-muted-foreground">Size</label>
            <Input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              min={10}
              max={24}
              className="mt-1 w-24 h-8 text-sm"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground">Family</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="mt-1 w-full h-8 text-sm bg-background text-foreground border border-input rounded-md px-2 [&>option]:bg-background [&>option]:text-foreground"
            >
              {APP_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Preset Themes */}
      <section>
        <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
          Preset Themes
        </h4>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {PRESET_THEMES.map((theme) => (
            <ThemeCard
              key={theme.name}
              theme={theme}
              isActive={activeThemeName === theme.name}
              onClick={() => setPresetTheme(theme.name)}
            />
          ))}
        </div>
      </section>

      {/* Terminal Font */}
      <section>
        <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
          Terminal Font
        </h4>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-xs text-muted-foreground">Size</label>
            <Input
              type="number"
              value={terminalTheme.terminalFontSize}
              onChange={(e) => setTerminalFontSize(Number(e.target.value))}
              min={8}
              max={32}
              className="mt-1 w-20 h-8 text-sm"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground">Family</label>
            <select
              value={terminalTheme.terminalFontFamily}
              onChange={(e) => setTerminalFontFamily(e.target.value)}
              className="mt-1 w-full h-8 text-sm bg-background text-foreground border border-input rounded-md px-2 [&>option]:bg-background [&>option]:text-foreground"
            >
              {TERMINAL_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Terminal Colors */}
      <section>
        <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
          Colors
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TERMINAL_COLOR_KEYS.map(({ key, label }) => (
            <ColorField
              key={key}
              label={label}
              value={terminalTheme[key]}
              onChange={(v) => setCustomColor(key as TerminalColorKey, v)}
            />
          ))}
        </div>
      </section>

      {/* ANSI Colors */}
      <section>
        <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
          ANSI Colors
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ANSI_COLOR_KEYS.map(({ key, label }) => (
            <ColorField
              key={key}
              label={label}
              value={terminalTheme[key]}
              onChange={(v) => setCustomColor(key as TerminalColorKey, v)}
            />
          ))}
        </div>
      </section>

      {/* Bright Colors */}
      <section>
        <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
          Bright Colors
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BRIGHT_COLOR_KEYS.map(({ key, label }) => (
            <ColorField
              key={key}
              label={label}
              value={terminalTheme[key]}
              onChange={(v) => setCustomColor(key as TerminalColorKey, v)}
            />
          ))}
        </div>
      </section>

      {/* Preview */}
      <section>
        <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
          Preview
        </h4>
        <ThemePreview theme={terminalTheme} />
      </section>

      {/* Reset */}
      <div>
        <Button variant="outline" size="sm" onClick={resetToPreset}>
          Reset to Preset
        </Button>
      </div>
    </div>
  );
}
