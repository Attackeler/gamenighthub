import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

import { ThemeContext } from './ThemeContext';
import { useThemeToggle } from './useThemeToggle';
import { MaterialCommunityIcons } from '@/shared/icons';

export const ThemeProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isDark, toggleTheme, isLoaded, theme } = useThemeToggle();

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <PaperProvider
        theme={theme}
        settings={{
          icon: (props) => <MaterialCommunityIcons {...props} />,
        }}
      >
        <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={theme.colors.background} />
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};
