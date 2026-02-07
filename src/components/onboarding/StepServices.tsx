import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MessageSquare, Sparkles, Brain } from 'lucide-react';

interface Provider {
  type: string;
  name: string;
  apiKey: string;
  model: string;
  enabled: boolean;
}

interface StepServicesProps {
  providers: Provider[];
  onChange: (index: number, field: string, value: string | boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

const providerIcons: Record<string, React.ElementType> = {
  claude: Brain,
  openai: Sparkles,
  gemini: MessageSquare,
};

export function StepServices({ providers, onChange, onNext, onBack }: StepServicesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">AI Services</h2>
        <p className="text-muted-foreground mt-2">
          Connect your AI providers. You can add API keys now or later in settings.
        </p>
      </div>

      <div className="space-y-4">
        {providers.map((provider, index) => {
          const Icon = providerIcons[provider.type] || MessageSquare;
          return (
            <div
              key={provider.type}
              className={cn(
                'rounded-lg border p-4 transition-colors',
                provider.enabled ? 'border-primary/50 bg-primary/5' : 'border-border',
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{provider.name}</span>
                </div>
                <button
                  onClick={() => onChange(index, 'enabled', !provider.enabled)}
                  className={cn(
                    'text-xs px-2 py-1 rounded',
                    provider.enabled
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {provider.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              {provider.enabled && (
                <div className="space-y-2">
                  <Input
                    type="password"
                    value={provider.apiKey}
                    onChange={(e) => onChange(index, 'apiKey', e.target.value)}
                    placeholder="API Key"
                  />
                  <Input
                    value={provider.model}
                    onChange={(e) => onChange(index, 'model', e.target.value)}
                    placeholder="Model (e.g., claude-sonnet-4-5-20250929)"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );
}
