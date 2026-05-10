import { create } from 'zustand';

interface SceneState {
  currentArea: 'hall' | 'projects' | 'blog' | 'about';
  isTransitioning: boolean;
  setArea: (area: SceneState['currentArea']) => void;
  setTransitioning: (value: boolean) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  currentArea: 'hall',
  isTransitioning: false,
  setArea: (area) => set({ currentArea: area }),
  setTransitioning: (value) => set({ isTransitioning: value }),
}));
