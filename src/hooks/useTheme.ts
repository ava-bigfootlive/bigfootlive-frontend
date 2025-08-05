import { useEffect, useState } from 'react';
import { applyTheme, getCurrentTheme } from '@/lib/themes';

export function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(getCurrentTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return { theme, setTheme, toggleTheme };
}