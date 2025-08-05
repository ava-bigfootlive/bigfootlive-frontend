// BigfootLive Theme Configuration
// Generated theme configuration for shadcn/ui components

export const themes = {
  dark: {
    name: "BigfootLive Dark",
    colors: {
      background: "0 0% 4%", // #0a0a0a
      foreground: "0 0% 100%", // #ffffff
      card: "0 0% 7%", // #121212
      "card-foreground": "0 0% 100%", // #ffffff
      popover: "0 0% 7%", // #121212
      "popover-foreground": "0 0% 100%", // #ffffff
      primary: "271 91% 65%", // #9333ea
      "primary-foreground": "0 0% 100%", // #ffffff
      secondary: "0 0% 15%", // #262626
      "secondary-foreground": "0 0% 100%", // #ffffff
      muted: "0 0% 15%", // #262626
      "muted-foreground": "0 0% 64%", // #a3a3a3
      accent: "328 85% 70%", // #ec4899
      "accent-foreground": "0 0% 100%", // #ffffff
      destructive: "0 84% 60%", // #ef4444
      "destructive-foreground": "0 0% 100%", // #ffffff
      border: "0 0% 15%", // #262626
      input: "0 0% 15%", // #262626
      ring: "271 91% 65%", // #9333ea
    },
    radius: "0.5rem"},
  light: {
    name: "BigfootLive Light",
    colors: {
      background: "0 0% 100%", // #ffffff
      foreground: "0 0% 4%", // #0a0a0a
      card: "0 0% 100%", // #ffffff
      "card-foreground": "0 0% 4%", // #0a0a0a
      popover: "0 0% 100%", // #ffffff
      "popover-foreground": "0 0% 4%", // #0a0a0a
      primary: "263 90% 58%", // #7c3aed
      "primary-foreground": "0 0% 100%", // #ffffff
      secondary: "0 0% 96%", // #f5f5f5
      "secondary-foreground": "0 0% 4%", // #0a0a0a
      muted: "0 0% 96%", // #f5f5f5
      "muted-foreground": "0 0% 45%", // #737373
      accent: "338 71% 51%", // #db2777
      "accent-foreground": "0 0% 100%", // #ffffff
      destructive: "0 84% 60%", // #ef4444
      "destructive-foreground": "0 0% 100%", // #ffffff
      border: "0 0% 89%", // #e3e3e3
      input: "0 0% 89%", // #e3e3e3
      ring: "263 90% 58%", // #7c3aed
    },
    radius: "0.5rem"}};

// Hex color reference for developers
export const hexColors = {
  dark: {
    background: "#0a0a0a",
    foreground: "#ffffff",
    card: "#121212",
    primary: "#9333ea",
    secondary: "#262626",
    muted: "#262626",
    accent: "#ec4899",
    border: "#262626"},
  light: {
    background: "#ffffff",
    foreground: "#0a0a0a",
    card: "#ffffff",
    primary: "#7c3aed",
    secondary: "#f5f5f5",
    muted: "#f5f5f5",
    accent: "#db2777",
    border: "#e3e3e3"}};

// Export theme as CSS variables string (for dynamic injection)
export function getThemeCssVariables(theme: 'dark' | 'light'): string {
  const selectedTheme = themes[theme];
  let css = ':root {\n';
  
  Object.entries(selectedTheme.colors).forEach(([key, value]) => {
    css += `  --${key}: ${value};\n`;
  });
  
  css += `  --radius: ${selectedTheme.radius};\n`;
  css += '}\n';
  
  return css;
}

// Theme toggle helper
export function applyTheme(theme: 'dark' | 'light') {
  const root = document.documentElement;
  
  if (theme === 'light') {
    root.classList.add('light');
  } else {
    root.classList.remove('light');
  }
  
  // Store preference
  localStorage.setItem('bigfootlive-theme', theme);
}

// Get current theme
export function getCurrentTheme(): 'dark' | 'light' {
  const stored = localStorage.getItem('bigfootlive-theme');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  
  // Check system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'dark'; // Default to dark theme
}

// Initialize theme on load
export function initializeTheme() {
  const theme = getCurrentTheme();
  applyTheme(theme);
}