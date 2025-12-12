/**
 * Theme Configuration
 *
 * Defines light and dark theme colors and utilities for theme management.
 */

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardHover: string;
    border: string;
    input: string;
    ring: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
  };
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: '#ffffff',
    foreground: '#111827',
    card: '#ffffff',
    cardHover: '#f9fafb',
    border: '#e5e7eb',
    input: '#f3f4f6',
    ring: '#3b82f6',
    muted: '#f3f4f6',
    mutedForeground: '#6b7280',
    accent: '#f3f4f6',
    accentForeground: '#111827',
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: '#030712',
    foreground: '#f9fafb',
    card: '#111827',
    cardHover: '#1f2937',
    border: '#374151',
    input: '#1f2937',
    ring: '#3b82f6',
    muted: '#1f2937',
    mutedForeground: '#9ca3af',
    accent: '#1f2937',
    accentForeground: '#f9fafb',
  },
};

export const getTheme = (mode: ThemeMode): Theme => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

// Theme utility functions
export const applyThemeToDocument = (theme: Theme) => {
  const root = document.documentElement;

  if (theme.mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Apply CSS variables for dynamic theming
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
};

// Detect system theme preference
export const getSystemTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Get theme from localStorage or system
export const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';

  const stored = localStorage.getItem('theme') as ThemeMode | null;
  if (stored && (stored === 'light' || stored === 'dark')) {
    return stored;
  }

  return getSystemTheme();
};

// Save theme to localStorage
export const saveTheme = (mode: ThemeMode) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', mode);
  }
};
