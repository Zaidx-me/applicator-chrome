export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentBg: string;
  border: string;
  error: string;
  green: string;
  orange: string;
  blue: string;
  purple: string;
  textWhite: string;
}

export const light: ThemeColors = {
  bg: '#F7F9FC',
  surface: '#FFFFFF',
  surfaceElevated: '#F0F2F5',
  textPrimary: '#1A1D26',
  textSecondary: '#5B5F6B',
  textTertiary: '#9A9EAB',
  accent: '#6366F1',
  accentBg: '#EEF0FF',
  border: '#E5E7EB',
  error: '#EF4444',
  green: '#22C55E',
  orange: '#F59E0B',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  textWhite: '#FFFFFF',
};

export const dark: ThemeColors = {
  bg: '#0F1117',
  surface: '#1A1D26',
  surfaceElevated: '#242731',
  textPrimary: '#EDEDEE',
  textSecondary: '#9A9EAB',
  textTertiary: '#5B5F6B',
  accent: '#818CF8',
  accentBg: '#1E1F3A',
  border: '#2A2D37',
  error: '#F87171',
  green: '#4ADE80',
  orange: '#FBBF24',
  blue: '#60A5FA',
  purple: '#A78BFA',
  textWhite: '#FFFFFF',
};

export const SPACING = {xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32} as const;
export const RADIUS = {sm: 6, md: 8, lg: 12, xl: 16, full: 999} as const;
