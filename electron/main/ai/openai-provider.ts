import OpenAI from 'openai';
import type { AIProvider, AIMessage, AIProviderConfig, AIStreamEvent } from './provider-interface';

export class OpenAIProvider implements AIProvider {
  name = 'ChatGPT';
  type = 'openai' as const;

  private toOpenAIMessages(messages: AIMessage[]): OpenAI.ChatCompletionMessageParam[] {
    return messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
  }

  async chat(messages: AIMessage[], config: AIProviderConfig): Promise<string> {
    const client = new OpenAI({ apiKey: config.apiKey });

    const response = await client.chat.completions.create({
      model: config.model || 'gpt-4o',
      messages: this.toOpenAIMessages(messages),
    });

    return response.choices[0]?.message?.content ?? '';
  }

  async chatStream(
    messages: AIMessage[],
    config: AIProviderConfig,
    onEvent: (event: AIStreamEvent) => void,
  ): Promise<void> {
    const client = new OpenAI({ apiKey: config.apiKey });

    const stream = await client.chat.completions.create({
      model: config.model || 'gpt-4o',
      messages: this.toOpenAIMessages(messages),
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        onEvent({ type: 'text', content: delta });
      }
    }

    onEvent({ type: 'done', content: '' });
  }
}
