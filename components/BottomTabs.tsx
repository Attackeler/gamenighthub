import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

import HomeScreen from '../screens/HomeScreen';

const Tab = createBottomTabNavigator();

export default function ButtonTabs() {
    const theme = useTheme();

    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.outline,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface, // optional!
                },
                tabBarIcon: ({ color, size }) => {
                    let iconName: keyof typeof MaterialCommunityIcons.glyphMap;
                    switch (route.name) {
                        case 'Home':
                            iconName = 'home';
                            break;
                        default:
                            iconName = 'help-circle';
                    }
                    return (
                        <MaterialCommunityIcons name={iconName} size={size} color={color} />
                    );
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Games" component={HomeScreen} />
            <Tab.Screen name="Friends" component={HomeScreen} />
            <Tab.Screen name="Profile" component={HomeScreen} />
            <Tab.Screen name="Stats" component={HomeScreen} />

        </Tab.Navigator>
    );
}
