import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getCurrentTheme, initializeTheme, applyTheme } from './themes';

// Mock matchMedia
const mockMatchMedia = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock document.documentElement
const mockDocumentElement = {
  classList: {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn(),
  },
  style: {
    setProperty: vi.fn(),
  },
};
Object.defineProperty(document, 'documentElement', {
  value: mockDocumentElement,
});

describe('Theme System', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCurrentTheme', () => {
    it('should return stored theme from localStorage when valid', () => {
      mockLocalStorage.getItem.mockReturnValue('light');
      
      const theme = getCurrentTheme();
      
      expect(theme).toBe('light');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('bigfootlive-theme');
    });

    it('should return stored dark theme from localStorage when valid', () => {
      mockLocalStorage.getItem.mockReturnValue('dark');
      
      const theme = getCurrentTheme();
      
      expect(theme).toBe('dark');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('bigfootlive-theme');
    });

    it('should return dark theme when system preference is dark and no stored theme', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockMatchMedia.mockReturnValue({
        matches: true, // prefers dark mode
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      const theme = getCurrentTheme();
      
      expect(theme).toBe('dark');
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('should return dark theme when system preference is light and no stored theme (default)', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockMatchMedia.mockReturnValue({
        matches: false, // prefers light mode
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      const theme = getCurrentTheme();
      
      expect(theme).toBe('dark'); // Default to dark
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('should return dark theme when localStorage contains invalid value', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid');
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      const theme = getCurrentTheme();
      
      expect(theme).toBe('dark');
    });
  });

  describe('applyTheme', () => {
    it('should apply dark theme correctly', () => {
      applyTheme('dark');
      
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('light', 'dark');
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('bigfootlive-theme', 'dark');
      
      // Check that CSS variables are set
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--background', '0 0% 12%');
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--foreground', '0 0% 95%');
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--primary', '271 91% 65%');
    });

    it('should apply light theme correctly', () => {
      applyTheme('light');
      
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('light', 'dark');
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('light');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('bigfootlive-theme', 'light');
      
      // Check that CSS variables are set
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--background', '0 0% 100%');
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--foreground', '0 0% 3.9%');
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--primary', '271 91% 55%');
    });
  });

  describe('initializeTheme', () => {
    it('should initialize with stored theme from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('light');
      
      initializeTheme();
      
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('light');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('bigfootlive-theme', 'light');
    });

    it('should initialize with system preference when no stored theme', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockMatchMedia.mockReturnValue({
        matches: true, // prefers dark mode
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      initializeTheme();
      
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('bigfootlive-theme', 'dark');
    });

    it('should initialize with dark theme as default', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockMatchMedia.mockReturnValue({
        matches: false, // prefers light mode, but we default to dark
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      initializeTheme();
      
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('bigfootlive-theme', 'dark');
    });
  });

  describe('Theme Priority Logic', () => {
    it('should prioritize localStorage over system preference', () => {
      // Set localStorage to light
      mockLocalStorage.getItem.mockReturnValue('light');
      // Set system preference to dark
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      const theme = getCurrentTheme();
      
      expect(theme).toBe('light'); // localStorage wins
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('bigfootlive-theme');
    });

    it('should use system preference when localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockMatchMedia.mockReturnValue({
        matches: true, // prefers dark
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      const theme = getCurrentTheme();
      
      expect(theme).toBe('dark');
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('should default to dark when localStorage is empty and system prefers light', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockMatchMedia.mockReturnValue({
        matches: false, // prefers light
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      const theme = getCurrentTheme();
      
      expect(theme).toBe('dark'); // Default to dark as specified
    });
  });
});
