import { useCallback } from 'react';
import { api } from '@/lib/ipc';

export function useDatabase() {
  const getSetting = useCallback(async (key: string): Promise<string | null> => {
    return api.db.getSetting(key);
  }, []);

  const setSetting = useCallback(async (key: string, value: string): Promise<boolean> => {
    return api.db.setSetting(key, value);
  }, []);

  return { getSetting, setSetting };
}
