import React from 'react';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';

interface StepGitHubProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepGitHub({ onNext, onBack }: StepGitHubProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">GitHub Integration</h2>
        <p className="text-muted-foreground mt-2">
          Connect your GitHub account to enable repository access and collaboration features.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 py-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Github className="w-8 h-8" />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          GitHub integration uses the Device Authorization Flow for secure authentication.
          <br />
          This feature will be available in a future update.
        </p>
        <Button variant="outline" disabled>
          Connect GitHub (Coming Soon)
        </Button>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Skip for Now
        </Button>
      </div>
    </div>
  );
}
