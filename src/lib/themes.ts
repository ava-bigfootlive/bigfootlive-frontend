// BigfootLive Theme Configuration
// Generated for optimal streaming platform experience

export const themes = {
  dark: {
    name: "BigfootLive Dark",
    cssVars: {
      "background": "0 0% 12%",
      "foreground": "0 0% 95%",
      "card": "0 0% 15%",
      "card-foreground": "0 0% 100%",
      "popover": "0 0% 15%",
      "popover-foreground": "0 0% 100%",
      "primary": "271 91% 45%",
      "primary-foreground": "0 0% 100%",
      "secondary": "0 0% 18%",
      "secondary-foreground": "0 0% 100%",
      "muted": "0 0% 18%",
      "muted-foreground": "0 0% 82%",
      "accent": "328 85% 70%",
      "accent-foreground": "0 0% 100%",
      "destructive": "0 84% 60%",
      "destructive-foreground": "0 0% 100%",
      "border": "0 0% 18%",
      "input": "0 0% 15%",
      "ring": "271 91% 35%",
      "radius": "0.5rem"},
    colors: {
      primary: "#7c2ef1",
      secondary: "#2e2e2e",
      accent: "#ec4899",
      background: "#1f1f1f",
      foreground: "#ffffff",
      card: "#262626",
      border: "#2e2e2e",
      live: "#ff4444",
      success: "#4ade80",
      warning: "#fbbf24",
      info: "#60a5fa"}
  },
  light: {
    name: "BigfootLive Light",
    cssVars: {
      "background": "0 0% 100%",
      "foreground": "0 0% 3.9%",
      "card": "0 0% 100%",
      "card-foreground": "0 0% 3.9%",
      "popover": "0 0% 100%",
      "popover-foreground": "0 0% 3.9%",
      "primary": "271 91% 25%",
      "primary-foreground": "0 0% 100%",
      "secondary": "0 0% 96%",
      "secondary-foreground": "0 0% 9%",
      "muted": "0 0% 96%",
      "muted-foreground": "0 0% 25%",
      "accent": "328 85% 60%",
      "accent-foreground": "0 0% 100%",
      "destructive": "0 84% 60%",
      "destructive-foreground": "0 0% 100%",
      "border": "0 0% 89%",
      "input": "0 0% 89%",
      "ring": "271 91% 55%",
      "radius": "0.5rem"},
    colors: {
      primary: "#7c3aed",
      secondary: "#f5f5f5",
      accent: "#db2777",
      background: "#ffffff",
      foreground: "#0a0a0a",
      card: "#ffffff",
      border: "#e3e3e3",
      live: "#ff0000",
      success: "#16a34a",
      warning: "#d97706",
      info: "#2563eb"}
  }
}

// Helper function to apply theme
export function applyTheme(theme: 'dark' | 'light') {
  const root = document.documentElement;
  const selectedTheme = themes[theme];
  
  // Remove existing theme class
  root.classList.remove('light', 'dark');
  
  // Add new theme class
  root.classList.add(theme);
  
  // Apply CSS variables
  Object.entries(selectedTheme.cssVars).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
  
  // Store theme preference
  localStorage.setItem('bigfootlive-theme', theme);
}

// Get current theme
export function getCurrentTheme(): 'dark' | 'light' {
  const stored = localStorage.getItem('bigfootlive-theme');
  if (stored === 'light' || stored === 'dark') {
    return stored as 'light' | 'dark';
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (prefersDark) {
    return 'dark';
  }
  // Default to light theme
  return 'light';
}

// Initialize theme on load
export function initializeTheme() {
  // Force light theme by clearing any stored preference
  localStorage.removeItem('bigfootlive-theme');
  applyTheme('light');
}
