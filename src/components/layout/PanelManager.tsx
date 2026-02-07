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

export function PanelManager() {
  const { currentView } = useAppStore();

  return (
    <div className="flex-1 overflow-hidden">
      {currentView === 'terminal' && <TerminalView />}
      {currentView === 'chat' && <ChatPanel />}
      {currentView === 'markdown' && <MarkdownEditor />}
      {currentView === 'canvas' && <CanvasPage />}
      {currentView === 'explorer' && <FileExplorer />}
      {currentView === 'memory' && <MemoryViewer />}
      {currentView === 'research' && <ResearchPanel />}
      {currentView === 'settings' && <SettingsPage />}
    </div>
  );
}
