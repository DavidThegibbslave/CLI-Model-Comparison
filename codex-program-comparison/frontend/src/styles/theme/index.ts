import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';
import { radii } from '../tokens/radius';
import { shadows } from '../tokens/shadows';

type ThemeDefinition = {
  name: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  secondary: string;
  border: string;
};

export const lightTheme: ThemeDefinition = {
  name: 'light',
  background: '#f8fafc',
  surface: '#ffffff',
  text: colors.neutral[900],
  muted: colors.neutral[600],
  primary: colors.primary[500],
  secondary: colors.secondary[500],
  border: colors.neutral[200],
};

export const darkTheme: ThemeDefinition = {
  name: 'dark',
  background: '#090f1c',
  surface: '#0f182b',
  text: '#e5edff',
  muted: '#9fb1d5',
  primary: '#6ea8ff',
  secondary: '#7dd3fc',
  border: '#1d2b44',
};

export const midnightTheme: ThemeDefinition = {
  name: 'midnight',
  background: '#050914',
  surface: '#0c1428',
  text: '#dbeafe',
  muted: '#94a3b8',
  primary: '#8b5cf6',
  secondary: '#22d3ee',
  border: '#1f2a44',
};

export const sunriseTheme: ThemeDefinition = {
  name: 'sunrise',
  background: '#fff7ed',
  surface: '#fff1e6',
  text: '#2f1f1a',
  muted: '#7a4a3c',
  primary: '#f97316',
  secondary: '#fbbf24',
  border: '#f2d0b5',
};

export const designTokens = {
  colors,
  spacing,
  typography,
  radii,
  shadows,
  themes: {
    light: lightTheme,
    dark: darkTheme,
    midnight: midnightTheme,
    sunrise: sunriseTheme,
  },
};

export type ThemeName = keyof typeof designTokens.themes;
