import React from 'react';
import { View } from 'react-native';
import { BottomTabBar, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Divider, useTheme } from 'react-native-paper';

import { AppTheme } from '@/app/theme/types';
import PlaceholderScreen from '@/shared/screens/PlaceholderScreen';
import GamesScreen from '@/features/games/screens/games/GamesScreen';
import HomeScreen from '@/features/home/screens/home/HomeScreen';

import { TabIcon } from './TabIcon';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const theme = useTheme<AppTheme>();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Tab.Navigator
        initialRouteName="home"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: theme.colors.tabBarActiveIcon,
          tabBarInactiveTintColor: theme.colors.tabBarInactiveIcon,
          tabBarStyle: {
            backgroundColor: theme.colors.background,
            borderTopWidth: 0,
          },
          tabBarIcon: ({ color, size }) => (
            <TabIcon routeName={route.name} color={color} size={size} />
          ),
        })}
        tabBar={(props) => (
          <View style={{ backgroundColor: theme.colors.background }}>
            <Divider
              style={{
                backgroundColor: theme.colors.outline,
                height: 1,
                maxWidth: 960,
                width: '90%',
                alignSelf: 'center',
              }}
            />
            <View style={{ maxWidth: 960, width: '90%', alignSelf: 'center' }}>
              <BottomTabBar {...props} />
            </View>
          </View>
        )}
      >
        <Tab.Screen name="home" component={HomeScreen} />
        <Tab.Screen name="games" component={GamesScreen} />
        <Tab.Screen name="friends" component={PlaceholderScreen} />
        <Tab.Screen name="stats" component={PlaceholderScreen} />
        <Tab.Screen name="profile" component={PlaceholderScreen} />
      </Tab.Navigator>
    </View>
  );
}
