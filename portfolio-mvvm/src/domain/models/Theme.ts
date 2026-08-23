/**
 * Domain Model: Theme
 * Represents the application theme configuration
 */
export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  typography: ThemeTypography;
}

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark'
}

export interface ThemeColors {
  // Primary
  primary: string;
  primaryContainer: string;
  onPrimary: string;
  
  // Surface
  background: string;
  surface: string;
  surfaceDim: string;
  surfaceContainer: string;
  surfaceContainerLow: string;
  surfaceContainerLowest: string;
  
  // Text
  onSurface: string;
  onSurfaceVariant: string;
  
  // Borders
  outline: string;
  outlineVariant: string;
}

export interface ThemeTypography {
  displayLg: TypographyStyle;
  headlineLg: TypographyStyle;
  headlineMd: TypographyStyle;
  bodyLg: TypographyStyle;
  bodyMd: TypographyStyle;
  labelCaps: TypographyStyle;
}

export interface TypographyStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing?: string;
}
