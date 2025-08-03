// context/ThemeProviderWrapper.tsx
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { ThemeContext } from './ThemeContext';
import { useThemeToggle } from './useThemeToggle';

export const ThemeProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isDark, toggleTheme, isLoaded, theme } = useThemeToggle();

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};
