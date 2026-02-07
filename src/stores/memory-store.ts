import { create } from 'zustand';
import type { Observation, Session } from '@/types';

interface MemoryStore {
  sessions: Session[];
  currentSession: Session | null;
  observations: Observation[];
  searchResults: Observation[];
  isSearching: boolean;
  setSessions: (sessions: Session[]) => void;
  setCurrentSession: (session: Session | null) => void;
  setObservations: (observations: Observation[]) => void;
  setSearchResults: (results: Observation[]) => void;
  setIsSearching: (searching: boolean) => void;
}

export const useMemoryStore = create<MemoryStore>((set) => ({
  sessions: [],
  currentSession: null,
  observations: [],
  searchResults: [],
  isSearching: false,
  setSessions: (sessions) => set({ sessions }),
  setCurrentSession: (session) => set({ currentSession: session }),
  setObservations: (observations) => set({ observations }),
  setSearchResults: (results) => set({ searchResults: results }),
  setIsSearching: (searching) => set({ isSearching: searching }),
}));
