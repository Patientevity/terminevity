export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIStreamEvent {
  type: 'text' | 'done' | 'error';
  content: string;
}

export interface AIProviderConfig {
  apiKey: string;
  model: string;
}

export interface AIProvider {
  name: string;
  type: 'claude' | 'openai' | 'gemini';
  chat(messages: AIMessage[], config: AIProviderConfig): Promise<string>;
  chatStream(
    messages: AIMessage[],
    config: AIProviderConfig,
    onEvent: (event: AIStreamEvent) => void,
  ): Promise<void>;
}
