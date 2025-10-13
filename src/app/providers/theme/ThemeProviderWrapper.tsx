import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

import { ThemeContext } from './ThemeContext';
import { useThemeToggle } from './useThemeToggle';

export const ThemeProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isDark, toggleTheme, isLoaded, theme } = useThemeToggle();

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <PaperProvider theme={theme}>
        <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={theme.colors.background} />
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};
