// File: app/_layout.tsx
import { ErrorBoundary } from 'expo-router';
import { useEffect } from 'react';
import useLoadFonts from './layout/useLoadFonts';
import RootLayoutNav from './layout/RootLayoutNav';

export { ErrorBoundary };

export default function RootLayout() {
  const { loaded, error } = useLoadFonts();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}