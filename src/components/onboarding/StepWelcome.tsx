import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface StepWelcomeProps {
  data: {
    name: string;
    goals: string;
    intents: string;
  };
  onChange: (field: string, value: string) => void;
  onNext: () => void;
}

export function StepWelcome({ data, onChange, onNext }: StepWelcomeProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Welcome to Terminevity</h2>
        <p className="text-muted-foreground mt-2">
          Let&apos;s get you set up. Tell us a bit about yourself.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Your Name</label>
          <Input
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Enter your name"
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Goals</label>
          <Textarea
            value={data.goals}
            onChange={(e) => onChange('goals', e.target.value)}
            placeholder="What are you working on? What do you want to accomplish?"
            className="mt-1"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Intents</label>
          <Textarea
            value={data.intents}
            onChange={(e) => onChange('intents', e.target.value)}
            placeholder="How do you plan to use Terminevity? (e.g., coding, writing, research)"
            className="mt-1"
            rows={3}
          />
        </div>
      </div>

      <Button onClick={onNext} className="w-full" disabled={!data.name.trim()}>
        Continue
      </Button>
    </div>
  );
}
