import React, { useCallback, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { useTerminalStore } from '@/stores/terminal-store';
import { TerminalComponent } from './Terminal';
import { api } from '@/lib/ipc';

export function TerminalView() {
  const { tabs, activeTabId, addTab, removeTab, setActiveTab } = useTerminalStore();

  const createNewTab = useCallback(() => {
    const id = uuidv4();
    addTab({
      id,
      label: `Terminal ${tabs.length + 1}`,
      terminalId: id,
    });
  }, [addTab, tabs.length]);

  const closeTab = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      api.terminal.close(id);
      removeTab(id);
    },
    [removeTab],
  );

  // Create first tab on mount
  useEffect(() => {
    if (tabs.length === 0) {
      createNewTab();
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center h-9 bg-background border-b border-border">
        <div className="flex items-center flex-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3 h-9 text-sm border-r border-border transition-colors shrink-0',
                activeTabId === tab.id
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50',
              )}
            >
              <span className="truncate max-w-[120px]">{tab.label}</span>
              <span
                onClick={(e) => closeTab(e, tab.id)}
                className="p-0.5 rounded hover:bg-muted-foreground/20"
              >
                <X className="w-3 h-3" />
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={createNewTab}
          className="flex items-center justify-center w-9 h-9 hover:bg-muted transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Terminal area */}
      <div className="flex-1 relative">
        {tabs.map((tab) => (
          <TerminalComponent
            key={tab.id}
            id={tab.terminalId}
            isActive={tab.id === activeTabId}
          />
        ))}
      </div>
    </div>
  );
}
