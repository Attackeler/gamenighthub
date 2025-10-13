import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameNight } from '../screens/home/HomeScreen.types';

const STORAGE_KEY = 'game_nights';

export function useGameNights() {
  const [gameNights, setGameNights] = useState<GameNight[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        const parsed: GameNight[] = JSON.parse(data);
        setGameNights(
          parsed.map((night) => ({
            ...night,
            members: night.members ?? [],
            invitedFriends: night.invitedFriends ?? [],
            selectedGames: night.selectedGames ?? [],
          })),
        );
      }
    });
  }, []);

  const saveGameNights = async (nights: GameNight[]) => {
    const normalized = nights.map((night) => ({
      ...night,
      members: night.members ?? [],
      invitedFriends: night.invitedFriends ?? [],
      selectedGames: night.selectedGames ?? [],
    }));
    setGameNights(normalized);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  };

  return { gameNights, saveGameNights };
}
