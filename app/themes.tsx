// /app/theme.tsx
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const LightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6C47FF',         // Purple buttons/icons
    secondary: '#F6A100',       // Orange (Join Room)
    background: '#FFFFFF',      // App background
    surface: '#F9F9FC',         // Card surface
    text: '#000000',
    outline: '#888888',         // Tab inactive
    success: '#32C685',
  },
};

export const DarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#3B82F6',         // Blue in dark mode
    secondary: '#1F2937',
    background: '#000000',      // Black background
    surface: '#111111',
    text: '#FFFFFF',
    outline: '#666666',
    success: '#4ADE80',
  },
};
