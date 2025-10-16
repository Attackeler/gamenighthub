import React from 'react';
import { NavigationIndependentTree } from '@react-navigation/native';
import { View } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';

import BottomTabs from '@/app/navigation/bottom-tabs/BottomTabs';
import Header from '@/app/navigation/header/Header';
import { AppTheme } from '@/app/theme/types';
import AuthScreen from '@/features/auth/screens/AuthScreen';
import useAuth from '@/features/auth/hooks/useAuth';
import MessagesBubble from '@/features/friends/components/MessagesBubble';

export default function TabLayout() {
  const theme = useTheme<AppTheme>();
  const { user, initializing, isEmailVerified } = useAuth();

  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  if (!user || !isEmailVerified) {
    return <AuthScreen />;
  }

  return (
    <NavigationIndependentTree>
      <View style={{ backgroundColor: theme.colors.background }}>
        <Header />
      </View>
      <BottomTabs />
      <MessagesBubble />
    </NavigationIndependentTree>
  );
}
