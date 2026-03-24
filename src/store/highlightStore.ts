import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HIGHLIGHTS_KEY = 'user_highlights';

export interface Highlight {
  id: string;
  text: string;
  articleSlug: string;
  articleTitle: string;
  createdAt: string;
}

interface HighlightState {
  highlights: Highlight[];
  loading: boolean;
  loadHighlights: () => Promise<void>;
  addHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => Promise<void>;
  removeHighlight: (id: string) => Promise<void>;
}

export const useHighlightStore = create<HighlightState>((set, get) => ({
  highlights: [],
  loading: false,

  loadHighlights: async () => {
    set({ loading: true });
    try {
      const raw = await AsyncStorage.getItem(HIGHLIGHTS_KEY);
      const highlights: Highlight[] = raw ? JSON.parse(raw) : [];
      set({ highlights, loading: false });
    } catch (e) {
      set({ loading: false });
      console.error('LOAD_HIGHLIGHTS_ERROR:', e);
    }
  },

  addHighlight: async (data) => {
    try {
      const newHighlight: Highlight = {
        ...data,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
      };
      const updated = [newHighlight, ...get().highlights];
      await AsyncStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(updated));
      set({ highlights: updated });
    } catch (e) {
      console.error('ADD_HIGHLIGHT_ERROR:', e);
      throw e;
    }
  },

  removeHighlight: async (id: string) => {
    try {
      const updated = get().highlights.filter((h) => h.id !== id);
      await AsyncStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(updated));
      set({ highlights: updated });
    } catch (e) {
      console.error('REMOVE_HIGHLIGHT_ERROR:', e);
      throw e;
    }
  },
}));
