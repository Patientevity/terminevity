import React, { useState } from 'react';
import { Settings, Keyboard, Brain, MessageSquare, Server, ChevronRight, ArrowLeft } from 'lucide-react';
import { useSettingsStore } from '@/stores/settings-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HotkeySettings } from './HotkeySettings';

export function SettingsPage() {
  const { theme, fontSize, fontFamily, setTheme, setFontSize, setFontFamily } = useSettingsStore();
  const [showHotkeys, setShowHotkeys] = useState(false);

  if (showHotkeys) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center h-12 px-4 border-b border-border">
          <button
            type="button"
            onClick={() => setShowHotkeys(false)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <Keyboard className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Keyboard Shortcuts</span>
        </div>
        <ScrollArea className="flex-1">
          <div className="max-w-2xl mx-auto p-6">
            <HotkeySettings />
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-12 px-4 border-b border-border">
        <Settings className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">Settings</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-2xl mx-auto p-6 space-y-8">
          {/* General */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              General
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Theme</label>
                <div className="flex gap-2 mt-1">
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
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Font Size</label>
                <Input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  min={10}
                  max={24}
                  className="mt-1 w-24"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Font Family</label>
                <Input
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </section>

          {/* Hotkeys */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Keyboard Shortcuts
            </h3>
            <button
              type="button"
              onClick={() => setShowHotkeys(true)}
              className="w-full flex items-center justify-between p-3 rounded-md border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="text-left">
                <p className="text-sm font-medium">Configure Keyboard Shortcuts</p>
                <p className="text-xs text-muted-foreground">View and customize all keybindings</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </section>

          {/* AI Providers */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              AI Providers
            </h3>
            <p className="text-sm text-muted-foreground">
              Provider management coming in Phase 12.
            </p>
          </section>

          {/* Memory */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Memory
            </h3>
            <p className="text-sm text-muted-foreground">
              Memory settings coming in Phase 7.
            </p>
          </section>

          {/* MCP */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Server className="w-4 h-4" />
              MCP Servers
            </h3>
            <p className="text-sm text-muted-foreground">
              MCP server configuration coming in Phase 11.
            </p>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
