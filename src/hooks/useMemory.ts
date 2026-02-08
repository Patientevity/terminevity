import { useCallback } from 'react';
import { useMemoryStore } from '@/stores/memory-store';
import { api } from '@/lib/ipc';

export function useMemory() {
  const { setSessions, setObservations, setSearchResults, setIsSearching } = useMemoryStore();

  const loadSessions = useCallback(async (limit?: number) => {
    const sessions = await api.memory.getSessions(limit);
    setSessions(sessions);
    return sessions;
  }, [setSessions]);

  const loadObservations = useCallback(async (sessionId: number) => {
    const observations = await api.memory.getObservations(sessionId);
    setObservations(observations);
    return observations;
  }, [setObservations]);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }
    setIsSearching(true);
    try {
      const results = await api.memory.search(query);
      setSearchResults(results);
      return results;
    } finally {
      setIsSearching(false);
    }
  }, [setSearchResults, setIsSearching]);

  const saveObservation = useCallback(async (
    sessionId: number,
    type: string,
    content: string,
    tags: string[] = [],
  ) => {
    return api.memory.saveObservation(sessionId, type, content, tags);
  }, []);

  const createSession = useCallback(async (title: string) => {
    return api.memory.createSession(title);
  }, []);

  return { loadSessions, loadObservations, search, saveObservation, createSession };
}
