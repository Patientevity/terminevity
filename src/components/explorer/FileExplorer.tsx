import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FileExplorer() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-12 px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          <span className="text-sm font-medium">File Explorer</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center text-center p-4">
        <div>
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">File Explorer</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Browse workspace files and send context to AI.
            <br />
            Full implementation coming in Phase 10.
          </p>
          <Button variant="outline" className="mt-4">
            Open Folder
          </Button>
        </div>
      </div>
    </div>
  );
}
