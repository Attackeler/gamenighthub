import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProviderWrapper } from '@/contexts/ThemeContext';

export default function RootLayoutNav() {
  return (
    <ThemeProviderWrapper>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </ThemeProviderWrapper>
  );
}
