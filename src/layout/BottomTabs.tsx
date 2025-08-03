import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

import HomeScreen from '../screens/HomeScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';

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
          backgroundColor: theme.colors.surface,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap;
          switch (route.name) {
            case 'Home': iconName = 'home'; break;
            case 'Games': iconName = 'gamepad-variant'; break;
            case 'Friends': iconName = 'account-group'; break;
            case 'Stats': iconName = 'chart-bar'; break;
            case 'Profile': iconName = 'account'; break;
            default: iconName = 'help-circle';
          }
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Games" component={PlaceholderScreen} />
      <Tab.Screen name="Friends" component={PlaceholderScreen} />
      <Tab.Screen name="Stats" component={PlaceholderScreen} />
      <Tab.Screen name="Profile" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
}
