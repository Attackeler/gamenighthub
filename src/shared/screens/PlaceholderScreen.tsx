import React from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { AppTheme } from '@/app/theme/types';

export default function PlaceholderScreen() {
  const theme = useTheme<AppTheme>();

  return (
    <View style={{ backgroundColor: theme.colors.background, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: theme.colors.text }}>Coming Soon!</Text>
    </View>
  );
}
