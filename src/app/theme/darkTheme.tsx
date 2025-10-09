import { MD3DarkTheme } from 'react-native-paper';

import { AppTheme } from './types';

export const DarkTheme: AppTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#3B82F6',
    secondary: '#1F2937',
    background: '#000000',
    surface: '#111111',
    text: '#FFFFFF',
    outline: '#3B82F6',
    success: '#4ADE80',
    divider: '#3B82F6',
    onCreateButton: '#ffffff',
    onJoinButton: '#ffffff',
    categoryBg: '#2D3748',
    categoryBorder: '#4A5568',
    categoryText: '#F3F4F6',
    categoryShadow: '#000',
    difficultyEasyBg: '#234F36',
    difficultyEasyText: '#4ADE80',
    difficultyMediumBg: '#4B2E09',
    difficultyMediumText: '#FDBA74',
    difficultyHardBg: '#4B2323',
    difficultyHardText: '#F87171',
    rippleCreate: 'rgba(255,255,255,0.3)',
    rippleJoin: 'rgba(0,0,0,0.1)',
    tabBarActiveIcon: '#3B82F6',
    tabBarInactiveIcon: '#4B5563',
  },
};
