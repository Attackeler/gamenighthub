import React from 'react';

import { NavigationIndependentTree } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { ThemeProviderWrapper } from '@/contexts/Theme/ThemeProviderWrapper';
import Header from '@/layout/Header/Header';
import { useTheme } from 'react-native-paper';
import { AppTheme } from '@/themes/types';
import { View } from 'react-native';
import BottomTabs from '@/layout/BottomTabs/BottomTabs';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
export default function TabLayout() {
  const theme = useTheme<AppTheme>();

  return (
    <ThemeProviderWrapper>
      <NavigationIndependentTree>
        <View style={{ backgroundColor: theme.colors.background }}>
          <Header />
        </View>
        <BottomTabs />
      </NavigationIndependentTree>
    </ThemeProviderWrapper>
  );
}
