// File: app/_layout.tsx
import { ErrorBoundary } from 'expo-router';
import { useEffect } from 'react';
import useLoadFonts from './layout/useLoadFonts';
import TabLayout from './index';

export { ErrorBoundary };

export default function RootLayout() {
  const { loaded, error } = useLoadFonts();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) return null;

  return <TabLayout />;
}