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
  },
};
