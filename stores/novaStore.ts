import { create } from 'zustand';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface NovaError {
  type: string;
  message: string;
  retryable?: boolean;
}

interface NovaState {
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
  error: NovaError | null;
  toggleOpen: () => void;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  setLoading: (value: boolean) => void;
  setError: (error: NovaState['error']) => void;
  clearMessages: () => void;
  trimMessages: (maxRounds: number) => void;
}

export const useNovaStore = create<NovaState>((set) => ({
  isOpen: false,
  messages: [],
  isLoading: false,
  error: null,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateLastMessage: (content) =>
    set((state) => {
      if (state.messages.length === 0) return state;
      const messages = [...state.messages];
      messages[messages.length - 1] = { ...messages[messages.length - 1], content };
      return { messages };
    }),
  setLoading: (value) => set({ isLoading: value }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [], error: null }),
  trimMessages: (maxRounds) =>
    set((state) => {
      const maxMessages = maxRounds * 2; // Each round has user + assistant message
      if (state.messages.length <= maxMessages) return state;
      return { messages: state.messages.slice(-maxMessages) };
    }),
}));
