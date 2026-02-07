import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useHotkeyStore } from '@/stores/hotkey-store';
import { HOTKEY_ACTIONS, CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/hotkey-defaults';
import { comboEquals } from '@/lib/hotkey-utils';
import { getDefaultBinding } from '@/lib/hotkey-defaults';
import { HotkeyInput } from './HotkeyInput';
import { Button } from '@/components/ui/button';
import type { HotkeyActionId, HotkeyCategory } from '@/types/hotkeys';

export function HotkeySettings() {
  const { bindings, setBinding, resetBinding, resetAllBindings } = useHotkeyStore();

  const actionsByCategory = CATEGORY_ORDER.reduce<Record<string, typeof HOTKEY_ACTIONS>>((acc, cat) => {
    acc[cat] = HOTKEY_ACTIONS.filter((a) => a.category === cat);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            Click a binding to change it. Press Escape to cancel.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetAllBindings}>
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset All
        </Button>
      </div>

      {CATEGORY_ORDER.map((category) => {
        const actions = actionsByCategory[category];
        if (!actions || actions.length === 0) return null;

        return (
          <div key={category}>
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
              {CATEGORY_LABELS[category]}
            </h4>
            <div className="space-y-2">
              {actions.map((action) => {
                const binding = bindings[action.id];
                const defaultBinding = getDefaultBinding(action.id);
                const isModified = !comboEquals(binding, defaultBinding);

                return (
                  <div
                    key={action.id}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{action.label}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <HotkeyInput
                        actionId={action.id}
                        binding={binding}
                        onBindingChange={(combo) => setBinding(action.id, combo)}
                      />
                      {isModified && (
                        <button
                          type="button"
                          onClick={() => resetBinding(action.id)}
                          className="p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Reset to default"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
