import 'react-native-get-random-values';

import { ErrorBoundary } from 'expo-router';
import { useEffect } from 'react';
import { Animated, Platform } from 'react-native';

import { ThemeProviderWrapper } from '@/app/providers/theme/ThemeProviderWrapper';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { UserProfileProvider } from '@/features/profile/context/UserProfileContext';

import useLoadFonts from './layout/useLoadFonts';
import TabLayout from './index';

export { ErrorBoundary };

if (Platform.OS === 'web') {
  const originalTiming = Animated.timing.bind(Animated);
  Animated.timing = ((value, config) =>
    originalTiming(value, { ...config, useNativeDriver: false })) as typeof Animated.timing;

  const originalSpring = Animated.spring.bind(Animated);
  Animated.spring = ((value, config) =>
    originalSpring(value, { ...config, useNativeDriver: false })) as typeof Animated.spring;

  const originalDecay = Animated.decay.bind(Animated);
  Animated.decay = ((value, config) =>
    originalDecay(value, { ...config, useNativeDriver: false })) as typeof Animated.decay;
}

export default function RootLayout() {
  const { loaded, error } = useLoadFonts();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) return null;

  return (
    <ThemeProviderWrapper>
      <AuthProvider>
        <UserProfileProvider>
          <TabLayout />
        </UserProfileProvider>
      </AuthProvider>
    </ThemeProviderWrapper>
  );
}
