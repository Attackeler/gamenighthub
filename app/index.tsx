import React from 'react';
import { View } from 'react-native';
import { NavigationIndependentTree } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';

import BottomTabs from '@/app/navigation/bottom-tabs/BottomTabs';
import Header from '@/app/navigation/header/Header';
import { ThemeProviderWrapper } from '@/app/providers/theme/ThemeProviderWrapper';
import { AppTheme } from '@/app/theme/types';

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
