import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DockPosition = 'left' | 'right' | 'bottom';

interface DockPositionState {
  position: DockPosition;
  setPosition: (position: DockPosition) => void;
}

export const useDockPositionStore = create<DockPositionState>()(
  persist(
    set => ({
      position: 'bottom',
      setPosition: position => set({ position }),
    }),
    {
      name: 'dock-position-storage',
    }
  )
);
