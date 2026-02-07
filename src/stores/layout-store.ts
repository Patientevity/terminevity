import { create } from 'zustand';

interface PanelConfig {
  id: string;
  type: 'terminal' | 'chat' | 'markdown' | 'canvas' | 'explorer';
  size: number;
}

interface LayoutStore {
  panels: PanelConfig[];
  splitDirection: 'horizontal' | 'vertical';
  setPanels: (panels: PanelConfig[]) => void;
  setSplitDirection: (direction: 'horizontal' | 'vertical') => void;
  addPanel: (panel: PanelConfig) => void;
  removePanel: (id: string) => void;
  resizePanel: (id: string, size: number) => void;
}

export const useLayoutStore = create<LayoutStore>((set) => ({
  panels: [{ id: 'main', type: 'terminal', size: 100 }],
  splitDirection: 'horizontal',
  setPanels: (panels) => set({ panels }),
  setSplitDirection: (direction) => set({ splitDirection: direction }),
  addPanel: (panel) =>
    set((state) => ({
      panels: [...state.panels, panel],
    })),
  removePanel: (id) =>
    set((state) => ({
      panels: state.panels.filter((p) => p.id !== id),
    })),
  resizePanel: (id, size) =>
    set((state) => ({
      panels: state.panels.map((p) => (p.id === id ? { ...p, size } : p)),
    })),
}));
