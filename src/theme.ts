export type ThemeMode = 'light' | 'dark';

export interface Colors {
  bg: string;
  bgDark: string;
  surface: string;
  surfaceElevated: string;
  accent: string;
  accentBg: string;
  green: string;
  greenBg: string;
  purple: string;
  purpleBg: string;
  blue: string;
  blueBg: string;
  orange: string;
  orangeBg: string;
  red: string;
  error: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textWhite: string;
  textBlack: string;
  border: string;
  borderDark: string;
  tabBg: string;
}

const DARK: Colors = {
  bg: '#0A0A0A',
  bgDark: '#050505',
  surface: '#1A1A1A',
  surfaceElevated: '#242424',
  accent: '#10B981',
  accentBg: 'rgba(16,185,129,0.12)',
  green: '#10B981',
  greenBg: 'rgba(16,185,129,0.12)',
  purple: '#3D5AFE',
  purpleBg: 'rgba(61,90,254,0.12)',
  blue: '#6C8CFF',
  blueBg: 'rgba(108,140,255,0.12)',
  orange: '#FFB74D',
  orangeBg: 'rgba(255,183,77,0.12)',
  red: '#FFB4AB',
  error: '#FFB4AB',
  textPrimary: '#E1E2E7',
  textSecondary: '#C5C5D9',
  textTertiary: '#8E8FA2',
  textWhite: '#FFFFFF',
  textBlack: '#000000',
  border: '#2A2A2A',
  borderDark: '#1F1F1F',
  tabBg: '#1A1A1A',
};

const LIGHT: Colors = {
  bg: '#F7F9FC',
  bgDark: '#ECEFF1',
  surface: '#FFFFFF',
  surfaceElevated: '#F2F4F7',
  accent: '#10B981',
  accentBg: 'rgba(16,185,129,0.10)',
  green: '#10B981',
  greenBg: 'rgba(16,185,129,0.10)',
  purple: '#5C6BC0',
  purpleBg: 'rgba(92,107,192,0.10)',
  blue: '#1A237E',
  blueBg: 'rgba(26,35,126,0.10)',
  orange: '#F59E0B',
  orangeBg: 'rgba(245,158,11,0.10)',
  red: '#BA1A1A',
  error: '#BA1A1A',
  textPrimary: '#191C1E',
  textSecondary: '#454652',
  textTertiary: '#767683',
  textWhite: '#FFFFFF',
  textBlack: '#000000',
  border: '#EAEAEA',
  borderDark: '#D0D0D0',
  tabBg: '#FFFFFF',
};

export function getColors(mode: ThemeMode): Colors {
  return mode === 'light' ? LIGHT : DARK;
}

export const SPACING = {
  xs: 4, sm: 10, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 40,
};

export const RADIUS = {
  sm: 10, md: 16, lg: 20, xl: 28, full: 9999,
};
