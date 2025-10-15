import { InteractionManager, useColorScheme } from 'react-native';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';

import { DarkTheme, LightTheme } from '@/app/theme';

import { getStoredTheme, setStoredTheme } from './theme-storage';

export function useThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [, startTransition] = useTransition();
  const systemTheme = useColorScheme();

  useEffect(() => {
    (async () => {
      const stored = await getStoredTheme();
      if (stored) {
        setIsDark(stored === 'dark');
      } else if (systemTheme) {
        setIsDark(systemTheme === 'dark');
      }
      setIsLoaded(true);
    })();
  }, [systemTheme]);

  const toggleTheme = useCallback(() => {
    startTransition(() => {
      setIsDark((prev) => {
        const next = !prev;
        InteractionManager.runAfterInteractions(() => {
          setStoredTheme(next ? 'dark' : 'light').catch((error) => {
            console.warn('Failed to persist theme selection', error);
          });
        });
        return next;
      });
    });
  }, [startTransition]);

  const theme = useMemo(() => (isDark ? DarkTheme : LightTheme), [isDark]);

  return { isDark, toggleTheme, isLoaded, theme };
}
