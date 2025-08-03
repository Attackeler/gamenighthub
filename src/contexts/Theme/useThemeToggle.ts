import { useEffect, useMemo, useState } from 'react';
import { DarkTheme, LightTheme } from '@/themes';
import { getStoredTheme, setStoredTheme } from './theme-storage';

export function useThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await getStoredTheme();
      if (stored) setIsDark(stored === 'dark');
      setIsLoaded(true);
    })();
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await setStoredTheme(next ? 'dark' : 'light');
  };

  const theme = useMemo(() => (isDark ? DarkTheme : LightTheme), [isDark]);

  return { isDark, toggleTheme, isLoaded, theme };
}
