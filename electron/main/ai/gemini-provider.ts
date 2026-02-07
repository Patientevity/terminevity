import type { AIProvider, AIMessage, AIProviderConfig, AIStreamEvent } from './provider-interface';

export class GeminiProvider implements AIProvider {
  name = 'Gemini';
  type = 'gemini' as const;

  async chat(messages: AIMessage[], config: AIProviderConfig): Promise<string> {
    // TODO: Implement with @google/generative-ai
    return 'Gemini provider not yet implemented';
  }

  async chatStream(
    messages: AIMessage[],
    config: AIProviderConfig,
    onEvent: (event: AIStreamEvent) => void,
  ): Promise<void> {
    // TODO: Implement streaming with @google/generative-ai
    onEvent({ type: 'text', content: 'Gemini streaming not yet implemented' });
    onEvent({ type: 'done', content: '' });
  }
}
