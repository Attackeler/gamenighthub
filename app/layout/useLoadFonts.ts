// File: app/layout/useLoadFonts.ts
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function useLoadFonts() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    MaterialCommunityIcons: require('../../assets/fonts/MaterialCommunityIcons.ttf'),
    Ionicons: require('../../assets/fonts/Ionicons.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  return { loaded, error };
}
