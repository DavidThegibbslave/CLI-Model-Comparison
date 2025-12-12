import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { designTokens, type ThemeName } from './index';

type ThemeContextValue = {
  theme: ThemeName;
  toggleTheme: () => void;
  setTheme: (name: ThemeName) => void;
  themes: ThemeName[];
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = 'cm_theme';
const themeOrder = Object.keys(designTokens.themes) as ThemeName[];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof localStorage === 'undefined') return 'light';
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    return stored && themeOrder.includes(stored) ? stored : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () =>
        setThemeState((current) => {
          const idx = themeOrder.indexOf(current);
          const next = idx === -1 ? 'light' : themeOrder[(idx + 1) % themeOrder.length];
          return next;
        }),
      setTheme: (name: ThemeName) => setThemeState(themeOrder.includes(name) ? name : 'light'),
      themes: themeOrder,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
