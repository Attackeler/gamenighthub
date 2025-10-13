import { MD3DarkTheme } from "react-native-paper";
import { AppTheme } from "./types";


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
    categoryBg: '#2D3748',         // lighter gray for pop
    categoryBorder: '#4A5568',     // more visible border
    categoryText: '#F3F4F6',       // light text
    categoryShadow: '#000',        // keep shadow
    difficultyEasyBg: '#234F36',      // pleasant green
    difficultyEasyText: '#4ADE80',    // soft green text
    difficultyMediumBg: '#4B2E09',    // pleasant orange-brown
    difficultyMediumText: '#FDBA74',  // soft orange text
    difficultyHardBg: '#4B2323',      // pleasant red-brown
    difficultyHardText: '#F87171',    // soft red text
    rippleCreate: 'rgba(255,255,255,0.3)', // for light
    rippleJoin: 'rgba(0,0,0,0.1)',         // for light
    tabBarActiveIcon: '#3B82F6',    // bright blue for active icon
    tabBarInactiveIcon: '#4B5563',  // muted gray for inactive icon
  },
};
