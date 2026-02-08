import { useCallback, useEffect } from 'react';
import { useChatStore } from '@/stores/chat-store';
import { api } from '@/lib/ipc';
import type { Message } from '@/types';

export function useChat() {
  const {
    activeConversationId,
    setConversations,
    setMessages,
    addMessage,
    setStreaming,
    setStreamingContent,
    appendStreamingContent,
    setActiveConversationId,
  } = useChatStore();

  const loadConversations = useCallback(async () => {
    const list = await api.chat.listConversations();
    setConversations(list);
  }, [setConversations]);

  const selectConversation = useCallback(async (id: number) => {
    setActiveConversationId(id);
    const msgs = await api.chat.getMessages(id);
    setMessages(msgs);
  }, [setActiveConversationId, setMessages]);

  const createConversation = useCallback(async (title: string, providerId?: number) => {
    const id = await api.chat.createConversation(title, providerId);
    await loadConversations();
    setActiveConversationId(id);
    setMessages([]);
    return id;
  }, [loadConversations, setActiveConversationId, setMessages]);

  const deleteConversation = useCallback(async (id: number) => {
    await api.chat.deleteConversation(id);
    if (useChatStore.getState().activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
    await loadConversations();
  }, [loadConversations, setActiveConversationId, setMessages]);

  const sendMessage = useCallback(async (
    content: string,
    providerType: string,
    apiKey: string,
    model: string,
  ) => {
    const convId = useChatStore.getState().activeConversationId;
    if (!convId) return;

    const msgId = await api.chat.saveMessage(convId, 'user', content);
    const userMsg: Message = {
      id: msgId,
      conversation_id: convId,
      role: 'user',
      content,
      tokens_used: null,
      created_at: new Date().toISOString(),
    };
    addMessage(userMsg);

    setStreaming(true);
    setStreamingContent('');

    const messages = useChatStore.getState().messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    api.ai.chatStream(convId, messages, providerType, apiKey, model);
  }, [addMessage, setStreaming, setStreamingContent]);

  useEffect(() => {
    const cleanup = api.ai.onStreamEvent((event) => {
      const convId = useChatStore.getState().activeConversationId;
      if (event.conversationId !== convId) return;

      if (event.type === 'text') {
        appendStreamingContent(event.content);
      } else if (event.type === 'done') {
        const finalContent = useChatStore.getState().streamingContent;
        const assistantMsg: Message = {
          id: Date.now(),
          conversation_id: event.conversationId,
          role: 'assistant',
          content: finalContent,
          tokens_used: null,
          created_at: new Date().toISOString(),
        };
        addMessage(assistantMsg);
        setStreaming(false);
        setStreamingContent('');
      } else if (event.type === 'error') {
        const assistantMsg: Message = {
          id: Date.now(),
          conversation_id: event.conversationId,
          role: 'assistant',
          content: `Error: ${event.content}`,
          tokens_used: null,
          created_at: new Date().toISOString(),
        };
        addMessage(assistantMsg);
        setStreaming(false);
        setStreamingContent('');
      }
    });

    return () => { cleanup(); };
  }, [addMessage, appendStreamingContent, setStreaming, setStreamingContent]);

  return {
    loadConversations,
    selectConversation,
    createConversation,
    deleteConversation,
    sendMessage,
  };
}
