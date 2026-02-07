import type { AIProvider, AIMessage, AIProviderConfig, AIStreamEvent } from './provider-interface';

export class ClaudeProvider implements AIProvider {
  name = 'Claude';
  type = 'claude' as const;

  async chat(messages: AIMessage[], config: AIProviderConfig): Promise<string> {
    // TODO: Implement with @anthropic-ai/sdk
    return 'Claude provider not yet implemented';
  }

  async chatStream(
    messages: AIMessage[],
    config: AIProviderConfig,
    onEvent: (event: AIStreamEvent) => void,
  ): Promise<void> {
    // TODO: Implement streaming with @anthropic-ai/sdk
    onEvent({ type: 'text', content: 'Claude streaming not yet implemented' });
    onEvent({ type: 'done', content: '' });
  }
}
