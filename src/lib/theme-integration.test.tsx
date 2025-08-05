import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { initializeTheme, applyTheme } from './themes';

// Test component that uses initializeTheme
function TestThemeComponent() {
  React.useEffect(() => {
    initializeTheme();
  }, []);
  
  return <div data-testid="theme-component">Theme Test Component</div>;
}

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

describe('Theme Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset document.documentElement classList
    document.documentElement.className = '';
    
    // Clear any existing CSS custom properties
    document.documentElement.style.cssText = '';
    
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.className = '';
    document.documentElement.style.cssText = '';
  });

  describe('initializeTheme with DOM', () => {
    it('should apply dark theme class to document.documentElement when localStorage has dark', () => {
      mockLocalStorage.getItem.mockReturnValue('dark');
      
      render(<TestThemeComponent />);
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('bigfootlive-theme', 'dark');
    });

    it('should apply light theme class to document.documentElement when localStorage has light', () => {
      mockLocalStorage.getItem.mockReturnValue('light');
      
      render(<TestThemeComponent />);
      
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('bigfootlive-theme', 'light');
    });

    it('should apply dark theme when no localStorage and system prefers dark', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockMatchMedia.mockReturnValue({
        matches: true, // prefers dark
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      render(<TestThemeComponent />);
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('bigfootlive-theme', 'dark');
    });

    it('should apply dark theme as default when no localStorage and system prefers light', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockMatchMedia.mockReturnValue({
        matches: false, // prefers light, but we default to dark
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      render(<TestThemeComponent />);
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('bigfootlive-theme', 'dark');
    });

    it('should set CSS custom properties for dark theme', () => {
      mockLocalStorage.getItem.mockReturnValue('dark');
      
      render(<TestThemeComponent />);
      
      // Check that CSS variables are set (they should be in the style attribute)
      expect(document.documentElement.style.getPropertyValue('--background')).toBe('0 0% 12%');
      expect(document.documentElement.style.getPropertyValue('--foreground')).toBe('0 0% 95%');
      expect(document.documentElement.style.getPropertyValue('--primary')).toBe('271 91% 65%');
    });

    it('should set CSS custom properties for light theme', () => {
      mockLocalStorage.getItem.mockReturnValue('light');
      
      render(<TestThemeComponent />);
      
      expect(document.documentElement.style.getPropertyValue('--background')).toBe('0 0% 100%');
      expect(document.documentElement.style.getPropertyValue('--foreground')).toBe('0 0% 3.9%');
      expect(document.documentElement.style.getPropertyValue('--primary')).toBe('271 91% 55%');
    });
  });

  describe('applyTheme with DOM', () => {
    it('should correctly switch from light to dark theme', () => {
      // Start with light theme
      document.documentElement.classList.add('light');
      
      applyTheme('dark');
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('bigfootlive-theme', 'dark');
    });

    it('should correctly switch from dark to light theme', () => {
      // Start with dark theme
      document.documentElement.classList.add('dark');
      
      applyTheme('light');
      
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('bigfootlive-theme', 'light');
    });

    it('should remove existing theme classes before applying new one', () => {
      // Start with both classes (shouldn't happen in reality, but test cleanup)
      document.documentElement.classList.add('light', 'dark', 'some-other-class');
      
      applyTheme('dark');
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
      expect(document.documentElement.classList.contains('some-other-class')).toBe(true); // Other classes preserved
    });
  });

  describe('Manual Toggle Storage', () => {
    it('should store preference when manually toggling theme', () => {
      // Test that manual toggle properly stores in localStorage
      applyTheme('light');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('bigfootlive-theme', 'light');
      
      vi.clearAllMocks();
      
      applyTheme('dark');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('bigfootlive-theme', 'dark');
    });

    it('should preserve manually set theme on subsequent loads', () => {
      // Manually set light theme
      applyTheme('light');
      expect(document.documentElement.classList.contains('light')).toBe(true);
      
      // Simulate a new page load where localStorage returns the stored value
      mockLocalStorage.getItem.mockReturnValue('light');
      
      // Initialize theme again
      initializeTheme();
      
      // Should still be light theme
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });
});
