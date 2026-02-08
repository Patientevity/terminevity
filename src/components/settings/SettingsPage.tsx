import React, { useState, useEffect } from 'react';
import { Settings, Keyboard, MessageSquare, ChevronRight, ArrowLeft, Palette } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/stores/app-store';
import { HotkeySettings } from './HotkeySettings';
import { ProviderSettings } from './ProviderSettings';
import { StyleSettings } from './StyleSettings';

export function SettingsPage() {
  const [subPage, setSubPage] = useState<'main' | 'hotkeys' | 'providers' | 'styles'>('main');
  const currentView = useAppStore((s) => s.currentView);

  // Reset to main page when navigating away and back
  useEffect(() => {
    if (currentView !== 'settings') {
      setSubPage('main');
    }
  }, [currentView]);

  if (subPage === 'hotkeys') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center h-12 px-4 border-b border-border">
          <button
            type="button"
            onClick={() => setSubPage('main')}
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

  if (subPage === 'providers') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center h-12 px-4 border-b border-border">
          <button
            type="button"
            onClick={() => setSubPage('main')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <MessageSquare className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">AI Providers</span>
        </div>
        <ScrollArea className="flex-1">
          <div className="max-w-2xl mx-auto p-6">
            <ProviderSettings />
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (subPage === 'styles') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center h-12 px-4 border-b border-border">
          <button
            type="button"
            onClick={() => setSubPage('main')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <Palette className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Styles</span>
        </div>
        <ScrollArea className="flex-1">
          <div className="max-w-2xl mx-auto p-6">
            <StyleSettings />
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
          {/* Styles */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Styles
            </h3>
            <button
              type="button"
              onClick={() => setSubPage('styles')}
              className="w-full flex items-center justify-between p-3 rounded-md border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="text-left">
                <p className="text-sm font-medium">Theme, Fonts & Colors</p>
                <p className="text-xs text-muted-foreground">Customize app theme, terminal appearance, and colors</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </section>

          {/* Hotkeys */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Keyboard Shortcuts
            </h3>
            <button
              type="button"
              onClick={() => setSubPage('hotkeys')}
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
            <button
              type="button"
              onClick={() => setSubPage('providers')}
              className="w-full flex items-center justify-between p-3 rounded-md border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="text-left">
                <p className="text-sm font-medium">Configure AI Providers</p>
                <p className="text-xs text-muted-foreground">Connect Claude, ChatGPT, and Gemini</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
