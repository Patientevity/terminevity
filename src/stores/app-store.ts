import { create } from 'zustand';
import type { ViewType } from '@/types';

interface AppStore {
  isOnboarded: boolean;
  isOnboardingChecked: boolean;
  currentView: ViewType;
  sidebarCollapsed: boolean;
  isVisible: boolean;
  setOnboarded: (value: boolean) => void;
  setOnboardingChecked: (value: boolean) => void;
  setCurrentView: (view: ViewType) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setVisible: (visible: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  isOnboarded: false,
  isOnboardingChecked: false,
  currentView: 'terminal',
  sidebarCollapsed: false,
  isVisible: true,
  setOnboarded: (value) => set({ isOnboarded: value }),
  setOnboardingChecked: (value) => set({ isOnboardingChecked: value }),
  setCurrentView: (view) => set({ currentView: view }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setVisible: (visible) => set({ isVisible: visible }),
}));
