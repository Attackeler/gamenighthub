import { MD3LightTheme } from 'react-native-paper';

import { AppTheme } from './types';

export const LightTheme: AppTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#1F2937',
    outline: '#E5E7EB',
    success: '#16A34A',
    divider: '#E5E7EB',
    onCreateButton: '#FFFFFF',
    onJoinButton: '#FFFFFF',
    categoryBg: '#EEF2FF',
    categoryBorder: '#C7D2FE',
    categoryText: '#3730A3',
    categoryShadow: '#E5E7EB',
    difficultyEasyBg: '#DCFCE7',
    difficultyEasyText: '#15803D',
    difficultyMediumBg: '#FEF3C7',
    difficultyMediumText: '#B45309',
    difficultyHardBg: '#FEE2E2',
    difficultyHardText: '#B91C1C',
    rippleCreate: 'rgba(0,0,0,0.1)',
    rippleJoin: 'rgba(0,0,0,0.1)',
    tabBarActiveIcon: '#3B82F6',
    tabBarInactiveIcon: '#9CA3AF',
  },
};
