import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, Plus, Trash2, Send, Loader2, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatStore } from '@/stores/chat-store';
import { useChat } from '@/hooks/useChat';
import { api } from '@/lib/ipc';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { AIProvider as AIProviderDB } from '@/types';

export function ChatPanel() {
  const {
    conversations,
    activeConversationId,
    messages,
    isStreaming,
    streamingContent,
  } = useChatStore();

  const {
    loadConversations,
    selectConversation,
    createConversation,
    deleteConversation,
    sendMessage,
  } = useChat();

  const [input, setInput] = useState('');
  const [providers, setProviders] = useState<AIProviderDB[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadConversations();
    loadProviders();
  }, [loadConversations]);

  const loadProviders = useCallback(async () => {
    const list = await api.ai.listProviders();
    setProviders(list);
    const defaultProvider = list.find((p: AIProviderDB) => p.is_default) ?? list[0];
    if (defaultProvider) {
      setSelectedProviderId(defaultProvider.id);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    let convId = activeConversationId;
    if (!convId) {
      const preview = text.slice(0, 40) + (text.length > 40 ? '...' : '');
      convId = await createConversation(preview);
    }

    const provider = providers.find((p) => p.id === selectedProviderId);
    if (!provider) return;

    const decryptedKey = await api.ai.decryptKey(provider.id);
    setInput('');

    await sendMessage(text, provider.type, decryptedKey, provider.model);
  }, [input, isStreaming, activeConversationId, createConversation, providers, selectedProviderId, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleNewChat = useCallback(async () => {
    await createConversation('New Conversation');
  }, [createConversation]);

  const activeProvider = providers.find((p) => p.id === selectedProviderId);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-12 px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm font-medium">AI Chat</span>
        </div>
        <div className="flex items-center gap-1">
          {providers.length > 1 && (
            <select
              value={selectedProviderId ?? ''}
              onChange={(e) => setSelectedProviderId(Number(e.target.value))}
              className="h-7 text-xs bg-background text-foreground border border-border rounded px-1.5 [&>option]:bg-background [&>option]:text-foreground"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.model})</option>
              ))}
            </select>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNewChat} title="New conversation">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversation list */}
        <div className="w-56 border-r border-border flex flex-col">
          <ScrollArea className="flex-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`w-full text-left px-3 py-2 border-b border-border hover:bg-muted/50 transition-colors group ${
                  activeConversationId === conv.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm truncate">{conv.title}</span>
                  <span
                    onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                    className="p-0.5 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {new Date(conv.updated_at).toLocaleDateString()}
                </div>
              </button>
            ))}
            {conversations.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-2">No conversations yet.</p>
                <Button variant="ghost" size="sm" onClick={handleNewChat} className="gap-1 text-xs">
                  <Plus className="w-3 h-3" />
                  Create
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {activeConversationId ? (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}>
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-sm prose-invert max-w-none text-sm">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Streaming message */}
                  {isStreaming && streamingContent && (
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <div className="max-w-[80%] rounded-lg px-3 py-2 bg-muted">
                        <div className="prose prose-sm prose-invert max-w-none text-sm">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}

                  {isStreaming && !streamingContent && (
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <div className="rounded-lg px-3 py-2 bg-muted">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input area */}
              <div className="p-3 border-t border-border">
                {providers.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Add an AI provider in Settings to start chatting.
                  </p>
                ) : (
                  <div className="flex gap-2 items-end">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={activeProvider ? `Message ${activeProvider.name}...` : 'Type a message...'}
                      className="flex-1 bg-muted rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary min-h-[40px] max-h-[120px]"
                      rows={1}
                      disabled={isStreaming}
                    />
                    <Button
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      disabled={!input.trim() || isStreaming || !selectedProviderId}
                      onClick={handleSend}
                    >
                      {isStreaming ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-4">
              <div>
                <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-sm font-medium">Start a conversation</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  {providers.length === 0
                    ? 'Add an AI provider in Settings first.'
                    : 'Create a new conversation to begin chatting.'}
                </p>
                {providers.length > 0 && (
                  <Button variant="outline" onClick={handleNewChat} className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Conversation
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
