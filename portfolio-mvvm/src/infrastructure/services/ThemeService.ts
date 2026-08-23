import { Theme, ThemeMode, ThemeColors } from '@models/Theme';

/**
 * Service: Theme Management
 * Handles theme state and persistence
 */
export class ThemeService {
  private static readonly STORAGE_KEY = 'portfolio-theme-mode';
  private currentTheme: Theme;
  private listeners: Set<(theme: Theme) => void> = new Set();

  constructor() {
    this.currentTheme = this.initializeTheme();
    this.applyTheme(this.currentTheme);
  }

  /**
   * Get current theme
   */
  getTheme(): Theme {
    return { ...this.currentTheme };
  }

  /**
   * Toggle between light and dark mode
   */
  toggleMode(): void {
    const newMode = this.currentTheme.mode === ThemeMode.DARK 
      ? ThemeMode.LIGHT 
      : ThemeMode.DARK;
    
    this.setMode(newMode);
  }

  /**
   * Set specific theme mode
   */
  setMode(mode: ThemeMode): void {
    this.currentTheme = {
      ...this.currentTheme,
      mode,
      colors: mode === ThemeMode.DARK ? this.getDarkColors() : this.getLightColors()
    };
    
    this.applyTheme(this.currentTheme);
    this.saveToStorage(mode);
    this.notifyListeners();
  }

  /**
   * Subscribe to theme changes
   */
  subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private initializeTheme(): Theme {
    const savedMode = this.loadFromStorage();
    const mode = savedMode || ThemeMode.DARK; // Default to dark
    
    return {
      mode,
      colors: mode === ThemeMode.DARK ? this.getDarkColors() : this.getLightColors(),
      typography: {
        displayLg: {
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '84px',
          fontWeight: '300',
          lineHeight: '92px',
          letterSpacing: '-0.02em'
        },
        headlineLg: {
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '48px',
          fontWeight: '400',
          lineHeight: '52px'
        },
        headlineMd: {
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '32px',
          fontWeight: '400',
          lineHeight: '38px'
        },
        bodyLg: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '18px',
          fontWeight: '300',
          lineHeight: '28px',
          letterSpacing: '0.01em'
        },
        bodyMd: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          fontWeight: '400',
          lineHeight: '24px'
        },
        labelCaps: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          fontWeight: '600',
          lineHeight: '16px',
          letterSpacing: '0.1em'
        }
      }
    };
  }

  private getDarkColors(): ThemeColors {
    return {
      primary: '#efe0c9',
      primaryContainer: '#d2c4ae',
      onPrimary: '#382f20',
      background: '#0E0E0E',
      surface: '#141312',
      surfaceDim: '#141312',
      surfaceContainer: '#211f1e',
      surfaceContainerLow: '#1d1b1a',
      surfaceContainerLowest: '#0f0e0d',
      onSurface: '#e7e1de',
      onSurfaceVariant: '#cec5ba',
      outline: '#979086',
      outlineVariant: '#4b463e'
    };
  }

  private getLightColors(): ThemeColors {
    // Light mode colors (inverse of dark)
    return {
      primary: '#675d4b',
      primaryContainer: '#efe1ca',
      onPrimary: '#ffffff',
      background: '#fffbff',
      surface: '#fffbff',
      surfaceDim: '#e7e1de',
      surfaceContainer: '#f2ece6',
      surfaceContainerLow: '#f8f2ec',
      surfaceContainerLowest: '#ffffff',
      onSurface: '#1d1b1a',
      onSurfaceVariant: '#4b463e',
      outline: '#7c7569',
      outlineVariant: '#cec5ba'
    };
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    // Apply mode class
    root.classList.remove('light', 'dark');
    root.classList.add(theme.mode);
    
    // Apply CSS variables
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-primary-container', theme.colors.primaryContainer);
    root.style.setProperty('--color-on-primary', theme.colors.onPrimary);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-surface-dim', theme.colors.surfaceDim);
    root.style.setProperty('--color-surface-container', theme.colors.surfaceContainer);
    root.style.setProperty('--color-on-surface', theme.colors.onSurface);
    root.style.setProperty('--color-on-surface-variant', theme.colors.onSurfaceVariant);
    root.style.setProperty('--color-outline', theme.colors.outline);
    root.style.setProperty('--color-outline-variant', theme.colors.outlineVariant);
  }

  private saveToStorage(mode: ThemeMode): void {
    try {
      localStorage.setItem(ThemeService.STORAGE_KEY, mode);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }

  private loadFromStorage(): ThemeMode | null {
    try {
      const saved = localStorage.getItem(ThemeService.STORAGE_KEY);
      return saved as ThemeMode | null;
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
      return null;
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentTheme));
  }
}
