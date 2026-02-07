import { useCallback } from 'react';

export function useMemory() {
  const search = useCallback(async (_query: string) => {
    // TODO: Implement memory search via IPC
    return [];
  }, []);

  const saveObservation = useCallback(async (_observation: {
    type: string;
    content: string;
    tags: string[];
  }) => {
    // TODO: Implement save observation via IPC
    return true;
  }, []);

  return { search, saveObservation };
}
