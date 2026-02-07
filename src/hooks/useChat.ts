import { useCallback } from 'react';
import { useChatStore } from '@/stores/chat-store';

export function useChat() {
  const { addMessage, setStreaming, updateLastMessage } = useChatStore();

  const sendMessage = useCallback(async (_instanceId: string, _content: string) => {
    // TODO: Implement AI chat via IPC
    // This will call the appropriate AI provider and stream the response
  }, [addMessage, setStreaming, updateLastMessage]);

  return { sendMessage };
}
