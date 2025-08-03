import { MD3Colors, MD3Theme } from "react-native-paper"
export type CustomColors = {
    divider: string;
    onCreateButton: string;
    onJoinButton: string;
}
export type ColorScheme = CustomColors & MD3Colors 

export type AppTheme = MD3Theme & {
    colors: ColorScheme
}