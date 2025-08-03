import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'APP_THEME_MODE';

export const getStoredTheme = async (): Promise<'light' | 'dark' | null> => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return null;
};

export const setStoredTheme = async (theme: 'light' | 'dark') => {
  await AsyncStorage.setItem(STORAGE_KEY, theme);
};
