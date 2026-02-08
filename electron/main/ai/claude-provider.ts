import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, AIMessage, AIProviderConfig, AIStreamEvent } from './provider-interface';

export class ClaudeProvider implements AIProvider {
  name = 'Claude';
  type = 'claude' as const;

  private toAnthropicMessages(messages: AIMessage[]): { role: 'user' | 'assistant'; content: string }[] {
    return messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
  }

  private getSystemPrompt(messages: AIMessage[]): string | undefined {
    const systemMsg = messages.find((m) => m.role === 'system');
    return systemMsg?.content;
  }

  async chat(messages: AIMessage[], config: AIProviderConfig): Promise<string> {
    if (!config.apiKey) {
      throw new Error('Claude API key is not configured. Go to Settings > AI Providers to add your key.');
    }
    const client = new Anthropic({ apiKey: config.apiKey });
    const system = this.getSystemPrompt(messages);

    const response = await client.messages.create({
      model: config.model || 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      ...(system ? { system } : {}),
      messages: this.toAnthropicMessages(messages),
    });

    const textBlocks = response.content.filter((b) => b.type === 'text');
    return textBlocks.map((b) => b.text).join('');
  }

  async chatStream(
    messages: AIMessage[],
    config: AIProviderConfig,
    onEvent: (event: AIStreamEvent) => void,
  ): Promise<void> {
    if (!config.apiKey) {
      throw new Error('Claude API key is not configured. Go to Settings > AI Providers to add your key.');
    }
    const client = new Anthropic({ apiKey: config.apiKey });
    const system = this.getSystemPrompt(messages);

    const stream = client.messages.stream({
      model: config.model || 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      ...(system ? { system } : {}),
      messages: this.toAnthropicMessages(messages),
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        const delta = event.delta as any;
        if (delta.type === 'text_delta' && delta.text) {
          onEvent({ type: 'text', content: delta.text });
        }
      }
    }

    onEvent({ type: 'done', content: '' });
  }
}
