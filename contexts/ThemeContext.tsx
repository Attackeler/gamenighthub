// /context/ThemeContext.tsx
import React, { createContext, useContext, useState, useMemo } from 'react';
import { PaperProvider, useTheme as usePaperTheme } from 'react-native-paper';
import { DarkTheme, LightTheme } from '@/themes';

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

export const useThemeToggle = () => useContext(ThemeContext);

export const ThemeProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark((prev) => !prev);

  const theme = useMemo(() => (isDark ? DarkTheme : LightTheme), [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};
