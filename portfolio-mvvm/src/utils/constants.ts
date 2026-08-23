/**
 * Application Constants
 */

export const APP_NAME = 'Portfolio';
export const APP_VERSION = '1.0.0';

export const STORAGE_KEYS = {
  THEME: 'portfolio-theme-mode',
  SCROLL_POSITION: 'portfolio-scroll-position'
} as const;

export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500
} as const;

export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1440
} as const;
