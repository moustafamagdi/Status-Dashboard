/**
 * Phase 4.1: Theme Management System
 * Handles dark/light theme with system preference detection and persistence
 */

const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
};

const STORAGE_KEY = 'shd_theme';
const TRANSITION_CLASS = 'theme-transition';

/**
 * Enhanced color palettes for both themes
 */
const THEME_COLORS = {
  dark: {
    bg: '#0d1117',
    surface: '#161b22',
    card: '#1c2128',
    border: '#30363d',
    text: '#e6edf3',
    muted: '#8b949e',
    accent: '#58a6ff',
    accentHover: '#79c0ff',
    green: '#43A047',
    greenLight: '#66BB6A',
    amber: '#FFB300',
    amberLight: '#FFB74D',
    red: '#E53935',
    redLight: '#EF5350',
    blue: '#1976D2',
    blueDark: '#155BC3',
    shadowColor: 'rgba(0,0,0,.5)',
    inputBg: '#1c2128',
    scrollThumb: '#30363d',
    tooltipBg: '#1c2128',
  },
  light: {
    bg: '#f4f6f9',
    surface: '#ffffff',
    card: '#f0f2f5',
    border: '#d0d7de',
    text: '#1f2328',
    muted: '#656d76',
    accent: '#0969da',
    accentHover: '#0860ca',
    green: '#2da44e',
    greenLight: '#26843b',
    amber: '#d29922',
    amberLight: '#bf8700',
    red: '#cf222e',
    redLight: '#da3633',
    blue: '#0550ae',
    blueDark: '#033a8b',
    shadowColor: 'rgba(0,0,0,.12)',
    inputBg: '#ffffff',
    scrollThumb: '#c8d0da',
    tooltipBg: '#ffffff',
  },
};

class ThemeManager {
  constructor() {
    this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
    this.listeners = [];
  }

  /**
   * Get theme from localStorage
   */
  getStoredTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored && Object.values(THEMES).includes(stored) ? stored : null;
    } catch {
      return null;
    }
  }

  /**
   * Detect system theme preference
   */
  getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return THEMES.LIGHT;
    }
    return THEMES.DARK;
  }

  /**
   * Get current theme
   */
  getTheme() {
    return this.currentTheme;
  }

  /**
   * Set theme and update DOM
   */
  setTheme(theme) {
    if (!Object.values(THEMES).includes(theme)) {
      console.warn(`Invalid theme: ${theme}`);
      return;
    }

    if (theme === this.currentTheme) {
      return;
    }

    this.currentTheme = theme;

    // Apply theme to DOM
    this.applyTheme();

    // Persist preference
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Failed to persist theme preference:', e);
    }

    // Notify listeners
    this.listeners.forEach((listener) => listener(theme));
  }

  /**
   * Toggle between dark and light themes
   */
  toggle() {
    const next = this.currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    this.setTheme(next);
  }

  /**
   * Apply theme to document
   */
  applyTheme() {
    const html = document.documentElement;

    // Add transition class for smooth animation
    html.classList.add(TRANSITION_CLASS);

    // Set data attribute
    html.setAttribute('data-theme', this.currentTheme);

    // Update CSS variables
    this.updateCSSVariables();

    // Update button UI
    this.updateThemeButton();

    // Remove transition class after animation completes
    setTimeout(() => {
      html.classList.remove(TRANSITION_CLASS);
    }, 350);
  }

  /**
   * Update CSS custom properties
   */
  updateCSSVariables() {
    const colors = THEME_COLORS[this.currentTheme];
    const root = document.documentElement;

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${this.camelToKebab(key)}`, value);
    });
  }

  /**
   * Convert camelCase to kebab-case
   */
  camelToKebab(str) {
    return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  }

  /**
   * Update theme toggle button UI
   */
  updateThemeButton() {
    const icon = document.getElementById('theme-icon');
    const label = document.getElementById('theme-label');

    if (icon) {
      icon.textContent = this.currentTheme === THEMES.DARK ? '🌙' : '☀️';
      icon.setAttribute('aria-label', `Current theme: ${this.currentTheme}`);
    }

    if (label) {
      label.textContent = this.currentTheme === THEMES.DARK ? 'Dark' : 'Light';
    }
  }

  /**
   * Subscribe to theme changes
   */
  onChange(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
      return () => {
        this.listeners = this.listeners.filter((l) => l !== callback);
      };
    }
  }

  /**
   * Setup system theme preference listener
   */
  initSystemPreferenceListener() {
    if (!window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (e) => {
      const systemTheme = e.matches ? THEMES.LIGHT : THEMES.DARK;
      // Only apply if user hasn't manually set theme
      if (!this.getStoredTheme()) {
        this.setTheme(systemTheme);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
    }
  }

  /**
   * Get all available themes
   */
  getAvailableThemes() {
    return Object.values(THEMES);
  }

  /**
   * Check if dark theme is active
   */
  isDark() {
    return this.currentTheme === THEMES.DARK;
  }

  /**
   * Check if light theme is active
   */
  isLight() {
    return this.currentTheme === THEMES.LIGHT;
  }

  /**
   * Get current theme colors
   */
  getCurrentColors() {
    return { ...THEME_COLORS[this.currentTheme] };
  }
}

// Export singleton
export const themeManager = new ThemeManager();

/**
 * Initialize theme on page load
 */
export const initTheme = () => {
  themeManager.applyTheme();
  themeManager.initSystemPreferenceListener();
};

/**
 * Legacy function for compatibility with inline script
 */
export const toggleTheme = () => {
  themeManager.toggle();
};

/**
 * Legacy function for compatibility with inline script
 */
export const applyTheme = () => {
  themeManager.applyTheme();
};
