import type { AIProvider, AIMessage, AIProviderConfig, AIStreamEvent } from './provider-interface';

export class OpenAIProvider implements AIProvider {
  name = 'ChatGPT';
  type = 'openai' as const;

  async chat(messages: AIMessage[], config: AIProviderConfig): Promise<string> {
    // TODO: Implement with openai SDK
    return 'OpenAI provider not yet implemented';
  }

  async chatStream(
    messages: AIMessage[],
    config: AIProviderConfig,
    onEvent: (event: AIStreamEvent) => void,
  ): Promise<void> {
    // TODO: Implement streaming with openai SDK
    onEvent({ type: 'text', content: 'OpenAI streaming not yet implemented' });
    onEvent({ type: 'done', content: '' });
  }
}
