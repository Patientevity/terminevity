import type { AIProvider } from './provider-interface';
import { ClaudeProvider } from './claude-provider';
import { OpenAIProvider } from './openai-provider';
import { GeminiProvider } from './gemini-provider';

export class AIManager {
  private providers = new Map<string, AIProvider>();

  constructor() {
    this.registerProvider(new ClaudeProvider());
    this.registerProvider(new OpenAIProvider());
    this.registerProvider(new GeminiProvider());
  }

  registerProvider(provider: AIProvider): void {
    this.providers.set(provider.type, provider);
  }

  getProvider(type: string): AIProvider | undefined {
    return this.providers.get(type);
  }

  listProviders(): { name: string; type: string }[] {
    return Array.from(this.providers.values()).map((p) => ({
      name: p.name,
      type: p.type,
    }));
  }
}
