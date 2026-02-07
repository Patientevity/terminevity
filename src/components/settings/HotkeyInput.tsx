import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { KeyCombo, HotkeyActionId } from '@/types/hotkeys';
import { keyboardEventToBinding, formatBindingForDisplay, findConflict } from '@/lib/hotkey-utils';
import { getActionById } from '@/lib/hotkey-defaults';
import { useHotkeyStore } from '@/stores/hotkey-store';

interface HotkeyInputProps {
  actionId: HotkeyActionId;
  binding: KeyCombo;
  onBindingChange: (combo: KeyCombo) => { success: boolean; conflictWith?: HotkeyActionId };
}

export function HotkeyInput({ actionId, binding, onBindingChange }: HotkeyInputProps) {
  const [capturing, setCapturing] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);
  const ref = useRef<HTMLButtonElement>(null);
  const bindings = useHotkeyStore((s) => s.bindings);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape') {
        setCapturing(false);
        setConflict(null);
        return;
      }

      const combo = keyboardEventToBinding(e);
      if (!combo) return;

      // Check for conflict before applying
      const conflictId = findConflict(bindings, combo, actionId);
      if (conflictId) {
        const conflictAction = getActionById(conflictId);
        setConflict(`Conflicts with "${conflictAction?.label ?? conflictId}"`);
        return;
      }

      const result = onBindingChange(combo);
      if (result.success) {
        setCapturing(false);
        setConflict(null);
      } else if (result.conflictWith) {
        const conflictAction = getActionById(result.conflictWith);
        setConflict(`Conflicts with "${conflictAction?.label ?? result.conflictWith}"`);
      }
    },
    [actionId, bindings, onBindingChange],
  );

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setCapturing(false);
        setConflict(null);
      }
    },
    [],
  );

  useEffect(() => {
    if (capturing) {
      document.addEventListener('keydown', handleKeyDown, true);
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => {
        document.removeEventListener('keydown', handleKeyDown, true);
        document.removeEventListener('mousedown', handleClickOutside, true);
      };
    }
  }, [capturing, handleKeyDown, handleClickOutside]);

  return (
    <div className="flex flex-col gap-1">
      <button
        ref={ref}
        type="button"
        onClick={() => {
          setCapturing(true);
          setConflict(null);
        }}
        className={`inline-flex items-center justify-center px-3 py-1 text-xs font-mono rounded border transition-colors min-w-[100px] ${
          capturing
            ? 'border-primary bg-primary/10 text-primary animate-pulse'
            : 'border-border bg-muted/50 text-foreground hover:bg-muted'
        }`}
      >
        {capturing ? 'Press keys...' : formatBindingForDisplay(binding)}
      </button>
      {conflict && (
        <span className="text-xs text-destructive">{conflict}</span>
      )}
    </div>
  );
}
