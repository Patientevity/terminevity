import { create } from 'zustand';
import type { AIMessage } from '@/types';

interface ChatInstance {
  id: string;
  title: string;
  providerId: number | null;
  messages: AIMessage[];
  isStreaming: boolean;
}

interface ChatStore {
  instances: ChatInstance[];
  activeInstanceId: string | null;
  addInstance: (instance: ChatInstance) => void;
  removeInstance: (id: string) => void;
  setActiveInstance: (id: string) => void;
  addMessage: (instanceId: string, message: AIMessage) => void;
  setStreaming: (instanceId: string, streaming: boolean) => void;
  updateLastMessage: (instanceId: string, content: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  instances: [],
  activeInstanceId: null,
  addInstance: (instance) =>
    set((state) => ({
      instances: [...state.instances, instance],
      activeInstanceId: instance.id,
    })),
  removeInstance: (id) =>
    set((state) => {
      const newInstances = state.instances.filter((i) => i.id !== id);
      return {
        instances: newInstances,
        activeInstanceId:
          state.activeInstanceId === id
            ? newInstances[newInstances.length - 1]?.id ?? null
            : state.activeInstanceId,
      };
    }),
  setActiveInstance: (id) => set({ activeInstanceId: id }),
  addMessage: (instanceId, message) =>
    set((state) => ({
      instances: state.instances.map((i) =>
        i.id === instanceId ? { ...i, messages: [...i.messages, message] } : i,
      ),
    })),
  setStreaming: (instanceId, streaming) =>
    set((state) => ({
      instances: state.instances.map((i) =>
        i.id === instanceId ? { ...i, isStreaming: streaming } : i,
      ),
    })),
  updateLastMessage: (instanceId, content) =>
    set((state) => ({
      instances: state.instances.map((i) => {
        if (i.id !== instanceId) return i;
        const messages = [...i.messages];
        if (messages.length > 0) {
          messages[messages.length - 1] = { ...messages[messages.length - 1], content };
        }
        return { ...i, messages };
      }),
    })),
}));
