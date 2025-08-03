// /context/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, LightTheme } from '@/themes';

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
};

const STORAGE_KEY = 'APP_THEME_MODE';

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

export const useThemeToggle = () => useContext(ThemeContext);

export const ThemeProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme preference from storage
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored === 'dark') setIsDark(true);
      if (stored === 'light') setIsDark(false);
      setIsLoaded(true);
    })();
  }, []);

  // Toggle theme and persist it
  const toggleTheme = async () => {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);
    await AsyncStorage.setItem(STORAGE_KEY, nextIsDark ? 'dark' : 'light');
  };

  const theme = useMemo(() => (isDark ? DarkTheme : LightTheme), [isDark]);

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};
