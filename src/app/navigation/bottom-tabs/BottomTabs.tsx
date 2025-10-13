import React from 'react';
import { BottomTabBar, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Divider, useTheme } from 'react-native-paper';
import { View } from 'react-native';

import { AppTheme } from '@/app/theme/types';

import { TabIcon } from './TabIcon';
import { tabs } from './TabConfig';

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
        {tabs.map(({ name, component }) => (
          <Tab.Screen key={name} name={name} component={component} />
        ))}
      </Tab.Navigator>
    </View>
  );
}
