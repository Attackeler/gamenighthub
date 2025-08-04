import { MD3LightTheme } from "react-native-paper";
import { AppTheme } from "./types";


export const LightTheme: AppTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6C47FF',
    secondary: '#F6A100',
    background: '#FFFFFF',
    surface: '#F9F9FC',
    text: '#000000',
    outline: '#cacacaff',
    success: '#32C685',
    divider: '#888888',
    onCreateButton: '#ffffff',
    onJoinButton: '#000000',
    categoryBg: '#fff',
    categoryBorder: '#d1d5db',
    categoryText: '#222',
    categoryShadow: '#000',
    difficultyEasyBg: '#C6F6D5',
    difficultyEasyText: '#16A34A',
    difficultyMediumBg: '#FED7AA',
    difficultyMediumText: '#EA580C',
    difficultyHardBg: '#FECACA',
    difficultyHardText: '#DC2626',
    rippleCreate: 'rgba(255,255,255,0.3)',
    rippleJoin: 'rgba(0,0,0,0.1)',       
    tabBarActiveIcon: '#6C47FF',   
    tabBarInactiveIcon: '#A0AEC0',  
  },
};