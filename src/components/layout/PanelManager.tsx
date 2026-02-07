import React from 'react';
import { useAppStore } from '@/stores/app-store';
import { TerminalView } from '@/components/terminal/TerminalTabs';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { MarkdownEditor } from '@/components/markdown/MarkdownEditor';
import { CanvasPage } from '@/components/canvas/CanvasPage';
import { FileExplorer } from '@/components/explorer/FileExplorer';
import { MemoryViewer } from '@/components/memory/MemoryViewer';
import { ResearchPanel } from '@/components/research/ResearchPanel';
import { SettingsPage } from '@/components/settings/SettingsPage';
import type { ViewType } from '@/types';

function Panel({ view, active, children }: { view: ViewType; active: boolean; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0" style={{ display: active ? 'block' : 'none' }}>
      {children}
    </div>
  );
}

export function PanelManager() {
  const { currentView } = useAppStore();

  return (
    <div className="flex-1 overflow-hidden relative">
      <Panel view="terminal" active={currentView === 'terminal'}>
        <TerminalView />
      </Panel>
      <Panel view="chat" active={currentView === 'chat'}>
        <ChatPanel />
      </Panel>
      <Panel view="markdown" active={currentView === 'markdown'}>
        <MarkdownEditor />
      </Panel>
      <Panel view="canvas" active={currentView === 'canvas'}>
        <CanvasPage />
      </Panel>
      <Panel view="explorer" active={currentView === 'explorer'}>
        <FileExplorer />
      </Panel>
      <Panel view="memory" active={currentView === 'memory'}>
        <MemoryViewer />
      </Panel>
      <Panel view="research" active={currentView === 'research'}>
        <ResearchPanel />
      </Panel>
      <Panel view="settings" active={currentView === 'settings'}>
        <SettingsPage />
      </Panel>
    </div>
  );
}
