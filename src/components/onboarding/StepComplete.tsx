import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, FileText, Palette, StickyNote } from 'lucide-react';

interface StepCompleteProps {
  preferredNoteTool: string;
  onSelectNoteTool: (tool: string) => void;
  onComplete: () => void;
  onBack: () => void;
}

const noteTools = [
  { id: 'builtin', label: 'Built-in Markdown', icon: FileText, description: 'Use Terminevity\'s markdown editor' },
  { id: 'obsidian', label: 'Obsidian', icon: StickyNote, description: 'Connect to Obsidian vault' },
  { id: 'canvas', label: 'Canvas', icon: Palette, description: 'Use the built-in whiteboard' },
];

export function StepComplete({ preferredNoteTool, onSelectNoteTool, onComplete, onBack }: StepCompleteProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Almost There!</h2>
        <p className="text-muted-foreground mt-2">
          Choose your preferred note-taking approach.
        </p>
      </div>

      <div className="space-y-3">
        {noteTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onSelectNoteTool(tool.id)}
            className={cn(
              'flex items-center gap-3 w-full p-4 rounded-lg border text-left transition-colors',
              preferredNoteTool === tool.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/50',
            )}
          >
            <tool.icon className="w-5 h-5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">{tool.label}</p>
              <p className="text-xs text-muted-foreground">{tool.description}</p>
            </div>
            {preferredNoteTool === tool.id && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onComplete} className="flex-1">
          Get Started
        </Button>
      </div>
    </div>
  );
}
