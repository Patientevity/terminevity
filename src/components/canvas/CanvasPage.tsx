import React from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CanvasPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-12 px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          <span className="text-sm font-medium">Canvas</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center text-center p-4">
        <div>
          <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Infinite Canvas</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Excalidraw-powered whiteboard for diagramming and brainstorming.
            <br />
            Full implementation coming in Phase 9.
          </p>
          <Button variant="outline" className="mt-4">
            New Canvas
          </Button>
        </div>
      </div>
    </div>
  );
}
