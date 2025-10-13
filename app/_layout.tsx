import 'react-native-get-random-values';

import { ErrorBoundary } from 'expo-router';
import { useEffect } from 'react';

import { ThemeProviderWrapper } from '@/app/providers/theme/ThemeProviderWrapper';

import useLoadFonts from './layout/useLoadFonts';
import TabLayout from './index';

export { ErrorBoundary };

export default function RootLayout() {
  const { loaded, error } = useLoadFonts();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) return null;

  return (
    <ThemeProviderWrapper>
      <TabLayout />
    </ThemeProviderWrapper>
  );
}
