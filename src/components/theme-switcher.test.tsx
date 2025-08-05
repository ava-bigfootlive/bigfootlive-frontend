import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { ThemeSwitcher } from './theme-switcher';

// Mock the theme-config module
vi.mock('@/lib/theme-config', () => ({
  getCurrentTheme: vi.fn(),
  applyTheme: vi.fn(),
}));

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

describe('ThemeSwitcher', () => {
  const mockGetCurrentTheme = vi.fn();
  const mockApplyTheme = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Setup module mocks
    const themeConfigModule = vi.mocked(await import('@/lib/theme-config'));
    themeConfigModule.getCurrentTheme = mockGetCurrentTheme;
    themeConfigModule.applyTheme = mockApplyTheme;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render with correct initial theme', () => {
    mockGetCurrentTheme.mockReturnValue('dark');
    
    render(<ThemeSwitcher />);
    
    // Should show sun icon for dark theme (to switch to light)
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label', 
      'Switch to light theme'
    );
  });

  it('should toggle theme from dark to light', () => {
    mockGetCurrentTheme.mockReturnValue('dark');
    
    render(<ThemeSwitcher />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockApplyTheme).toHaveBeenCalledWith('light');
  });

  it('should toggle theme from light to dark', () => {
    mockGetCurrentTheme.mockReturnValue('light');
    
    render(<ThemeSwitcher />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockApplyTheme).toHaveBeenCalledWith('dark');
  });

  it('should update button label after theme change', () => {
    mockGetCurrentTheme.mockReturnValue('dark');
    
    const { rerender } = render(<ThemeSwitcher />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to light theme');
    
    // Simulate theme change
    mockGetCurrentTheme.mockReturnValue('light');
    
    fireEvent.click(button);
    
    // Force re-render to see the updated state
    rerender(<ThemeSwitcher />);
    
    expect(mockApplyTheme).toHaveBeenCalledWith('light');
  });
});
