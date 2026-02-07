import React from 'react';
import { Search } from 'lucide-react';

export function ResearchPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-12 px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          <span className="text-sm font-medium">Research Assistant</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center text-center p-4">
        <div>
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Research Assistant</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Point AI at directories and files for deep context analysis.
            <br />
            Full implementation coming in Phase 10.
          </p>
        </div>
      </div>
    </div>
  );
}
