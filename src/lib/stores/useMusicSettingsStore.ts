import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MusicSettingsState {
  autoPlay: boolean;
  setAutoPlay: (autoPlay: boolean) => void;
  toggleAutoPlay: () => void;
}

export const useMusicSettingsStore = create<MusicSettingsState>()(
  persist(
    set => ({
      autoPlay: false,
      setAutoPlay: autoPlay => set({ autoPlay }),
      toggleAutoPlay: () => set(state => ({ autoPlay: !state.autoPlay })),
    }),
    {
      name: 'music-settings-storage',
    }
  )
);



