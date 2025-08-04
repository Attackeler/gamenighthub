import { MD3Colors, MD3Theme } from "react-native-paper"
export type CustomColors = {
    divider: string;
    onCreateButton: string;
    onJoinButton: string;
    categoryBg: string;
    categoryBorder: string;
    categoryText: string;
    categoryShadow: string;
    difficultyEasyBg: string;
    difficultyEasyText: string;
    difficultyMediumBg: string;
    difficultyMediumText: string;
    difficultyHardBg: string;
    difficultyHardText: string;
    rippleCreate: string; 
    rippleJoin: string;   
    tabBarActiveIcon: string;
    tabBarInactiveIcon: string;
}
export type ColorScheme = CustomColors & MD3Colors 

export type AppTheme = MD3Theme & {
    colors: ColorScheme
}