import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameNight } from './HomeScreen.types';

const STORAGE_KEY = 'game_nights';

export function useGameNights() {
  const [gameNights, setGameNights] = useState<GameNight[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) setGameNights(JSON.parse(data));
    });
  }, []);

  const saveGameNights = async (nights: GameNight[]) => {
    setGameNights(nights);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nights));
  };

  return { gameNights, saveGameNights };
}
