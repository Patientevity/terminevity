import React, { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Check, X, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/ipc';
import type { AIProvider } from '@/types';

interface ProviderDef {
  type: 'claude' | 'openai' | 'gemini';
  name: string;
  displayName: string;
  description: string;
  consoleUrl: string;
  signInLabel: string;
  defaultModel: string;
  models: { value: string; label: string }[];
  color: string;
}

const PROVIDERS: ProviderDef[] = [
  {
    type: 'claude',
    name: 'Claude',
    displayName: 'Claude by Anthropic',
    description: 'Advanced AI assistant with strong reasoning and coding capabilities.',
    consoleUrl: 'https://console.anthropic.com/settings/keys',
    signInLabel: 'Sign in to Anthropic',
    defaultModel: 'claude-sonnet-4-20250514',
    models: [
      { value: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
      { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
      { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
    ],
    color: 'text-orange-400',
  },
  {
    type: 'openai',
    name: 'ChatGPT',
    displayName: 'ChatGPT by OpenAI',
    description: 'Versatile AI models including GPT-4o and reasoning models.',
    consoleUrl: 'https://platform.openai.com/api-keys',
    signInLabel: 'Sign in to OpenAI',
    defaultModel: 'gpt-4o',
    models: [
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { value: 'o1', label: 'o1' },
      { value: 'o3-mini', label: 'o3-mini' },
    ],
    color: 'text-green-400',
  },
  {
    type: 'gemini',
    name: 'Gemini',
    displayName: 'Gemini by Google',
    description: 'Google\'s multimodal AI with fast and capable models.',
    consoleUrl: 'https://aistudio.google.com/apikey',
    signInLabel: 'Sign in to Google AI Studio',
    defaultModel: 'gemini-2.0-flash',
    models: [
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { value: 'gemini-2.0-pro', label: 'Gemini 2.0 Pro' },
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    ],
    color: 'text-blue-400',
  },
];

export function ProviderSettings() {
  const [savedProviders, setSavedProviders] = useState<AIProvider[]>([]);
  const [connectingType, setConnectingType] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  const loadProviders = useCallback(async () => {
    const list = await api.ai.listProviders();
    setSavedProviders(list);
  }, []);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const getProviderByType = (type: string) =>
    savedProviders.find((p) => p.type === type);

  const handleSignIn = useCallback((def: ProviderDef) => {
    api.app.openExternal(def.consoleUrl);
    setConnectingType(def.type);
    setApiKey('');
    setSelectedModel(def.defaultModel);
  }, []);

  const handleSave = useCallback(async (def: ProviderDef) => {
    if (!apiKey.trim()) return;

    const existing = getProviderByType(def.type);
    if (existing) {
      await api.ai.updateProvider(existing.id, {
        apiKey: apiKey.trim(),
        model: selectedModel || def.defaultModel,
      });
    } else {
      const isFirst = savedProviders.length === 0;
      await api.ai.saveProvider({
        name: def.name,
        type: def.type,
        apiKey: apiKey.trim(),
        model: selectedModel || def.defaultModel,
        isDefault: isFirst,
      });
    }

    setConnectingType(null);
    setApiKey('');
    await loadProviders();
  }, [apiKey, selectedModel, savedProviders, loadProviders]);

  const handleDisconnect = useCallback(async (id: number) => {
    await api.ai.deleteProvider(id);
    setConnectingType(null);
    await loadProviders();
  }, [loadProviders]);

  const handleSetDefault = useCallback(async (id: number) => {
    await api.ai.updateProvider(id, { isDefault: true });
    await loadProviders();
  }, [loadProviders]);

  const handleCancel = useCallback(() => {
    setConnectingType(null);
    setApiKey('');
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Connect your AI providers to use them in chat. Your API keys are encrypted and stored locally.
      </p>

      {PROVIDERS.map((def) => {
        const saved = getProviderByType(def.type);
        const isConnecting = connectingType === def.type;

        return (
          <div
            key={def.type}
            className="rounded-lg border border-border overflow-hidden"
          >
            {/* Card header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg font-bold ${def.color}`}>
                  {def.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold">{def.displayName}</h4>
                    {saved && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 font-medium">
                        Connected
                      </span>
                    )}
                    {saved?.is_default ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        Default
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{def.description}</p>
                  {saved && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Model: {saved.model}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {saved && !saved.is_default && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleSetDefault(saved.id)}
                  >
                    <Star className="w-3 h-3 mr-1" />
                    Set Default
                  </Button>
                )}
                {saved ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs hover:text-destructive"
                    onClick={() => handleDisconnect(saved.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Disconnect
                  </Button>
                ) : !isConnecting ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => handleSignIn(def)}
                  >
                    <ExternalLink className="w-3 h-3 mr-1.5" />
                    {def.signInLabel}
                  </Button>
                ) : null}
              </div>
            </div>

            {/* Connect form */}
            {isConnecting && (
              <div className="px-4 pb-4 pt-0 space-y-3 border-t border-border mt-0 pt-3">
                <p className="text-xs text-muted-foreground">
                  Get your API key from the page that just opened, then paste it below.
                </p>
                <div>
                  <label className="text-xs font-medium">API Key</label>
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste your API key here..."
                    className="mt-1 h-8 text-sm font-mono"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="mt-1 w-full h-8 text-sm bg-background text-foreground border border-border rounded px-2 [&>option]:bg-background [&>option]:text-foreground"
                  >
                    {def.models.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => handleSave(def)} disabled={!apiKey.trim()}>
                    <Check className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
