import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIProvider, AIMessage, AIProviderConfig, AIStreamEvent } from './provider-interface';

export class GeminiProvider implements AIProvider {
  name = 'Gemini';
  type = 'gemini' as const;

  private toGeminiHistory(messages: AIMessage[]): { role: string; parts: { text: string }[] }[] {
    return messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
  }

  private getSystemInstruction(messages: AIMessage[]): string | undefined {
    const systemMsg = messages.find((m) => m.role === 'system');
    return systemMsg?.content;
  }

  async chat(messages: AIMessage[], config: AIProviderConfig): Promise<string> {
    const genAI = new GoogleGenerativeAI(config.apiKey);
    const systemInstruction = this.getSystemInstruction(messages);
    const model = genAI.getGenerativeModel({
      model: config.model || 'gemini-2.0-flash',
      ...(systemInstruction ? { systemInstruction } : {}),
    });

    const history = this.toGeminiHistory(messages);
    const lastMessage = history.pop();
    if (!lastMessage) return '';

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    return result.response.text();
  }

  async chatStream(
    messages: AIMessage[],
    config: AIProviderConfig,
    onEvent: (event: AIStreamEvent) => void,
  ): Promise<void> {
    const genAI = new GoogleGenerativeAI(config.apiKey);
    const systemInstruction = this.getSystemInstruction(messages);
    const model = genAI.getGenerativeModel({
      model: config.model || 'gemini-2.0-flash',
      ...(systemInstruction ? { systemInstruction } : {}),
    });

    const history = this.toGeminiHistory(messages);
    const lastMessage = history.pop();
    if (!lastMessage) {
      onEvent({ type: 'done', content: '' });
      return;
    }

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastMessage.parts[0].text);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        onEvent({ type: 'text', content: text });
      }
    }

    onEvent({ type: 'done', content: '' });
  }
}
