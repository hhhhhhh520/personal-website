'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';

type Theme = 'dark';
type ResolvedTheme = 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: () => void;
  resolvedTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
  resolvedTheme: 'dark',
});

export function useTheme() {
  return useContext(ThemeContext);
}

function applyTheme() {
  const root = document.documentElement;
  root.classList.remove('light');
  root.classList.add('dark');
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    applyTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'dark', setTheme: () => {}, resolvedTheme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}
