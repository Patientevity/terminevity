import React from 'react';
import { Brain } from 'lucide-react';

export function MemoryViewer() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-12 px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4" />
          <span className="text-sm font-medium">Memory</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center text-center p-4">
        <div>
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Memory System</h3>
          <p className="text-sm text-muted-foreground mt-1">
            View observations, sessions, and search your AI memory.
            <br />
            Adapted from claude-mem. Full implementation coming in Phase 7.
          </p>
        </div>
      </div>
    </div>
  );
}
