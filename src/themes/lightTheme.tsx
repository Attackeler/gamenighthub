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
  },
};