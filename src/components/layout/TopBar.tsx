import React from 'react';
import { Minus, Square, X } from 'lucide-react';
import { api } from '@/lib/ipc';

export function TopBar() {
  return (
    <div className="flex items-center justify-between h-9 bg-background border-b border-border select-none app-drag">
      <div className="flex items-center gap-2 px-4">
        <span className="text-sm font-semibold text-foreground">Terminevity</span>
      </div>

      <div className="flex items-center app-no-drag">
        <button
          onClick={() => api.window.minimize()}
          className="inline-flex items-center justify-center w-12 h-9 hover:bg-muted transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => api.window.maximize()}
          className="inline-flex items-center justify-center w-12 h-9 hover:bg-muted transition-colors"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => api.window.close()}
          className="inline-flex items-center justify-center w-12 h-9 hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
