import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MarkdownEditor() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-12 px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">Markdown Editor</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center text-center p-4">
        <div>
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Markdown Editor</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Obsidian-style markdown editing with live preview.
            <br />
            Full implementation coming in Phase 8.
          </p>
          <Button variant="outline" className="mt-4">
            New Document
          </Button>
        </div>
      </div>
    </div>
  );
}
