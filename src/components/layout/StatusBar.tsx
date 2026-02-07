import React from 'react';

export function StatusBar() {
  return (
    <div className="flex items-center justify-between h-6 px-3 bg-background border-t border-border text-xs text-muted-foreground select-none">
      <div className="flex items-center gap-4">
        <span>Terminevity v0.1.0</span>
      </div>
      <div className="flex items-center gap-4">
        <span>F1 to toggle</span>
      </div>
    </div>
  );
}
