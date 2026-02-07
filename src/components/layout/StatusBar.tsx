import React from 'react';
import { useHotkeyStore } from '@/stores/hotkey-store';
import { formatBindingForDisplay } from '@/lib/hotkey-utils';

export function StatusBar() {
  const toggleBinding = useHotkeyStore((s) => s.bindings['toggle-window']);
  const toggleLabel = toggleBinding ? formatBindingForDisplay(toggleBinding) : 'F1';

  return (
    <div className="flex items-center justify-between h-6 px-3 bg-background border-t border-border text-xs text-muted-foreground select-none">
      <div className="flex items-center gap-4">
        <span>Terminevity v0.1.0</span>
      </div>
      <div className="flex items-center gap-4">
        <span>{toggleLabel} to toggle</span>
      </div>
    </div>
  );
}
