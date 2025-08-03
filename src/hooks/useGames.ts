// hooks/useGames.ts
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type Game = {
  id: string;
  name: string;
  description?: string;
  picture: string;
  duration: string;
  players: string;
  page: 'Home' | 'Games';
};

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    const fetchGames = async () => {
      if (db) {
        const snapshot = await getDocs(collection(db, 'games'));
        const data = snapshot.docs.map((doc) => {
          const raw = doc.data();
          return {
            id: doc.id,
            name: raw.name,
            description: raw.description ?? '',
            picture: raw.picture ?? '',
            duration: raw.duration ?? '',
            players: raw.players ?? '',
            page: (raw.page === 'Home' || raw.page === 'Games') ? raw.page : 'Home',
          } as Game;
        });
        setGames(data);
      }
    };

    fetchGames();
  }, []);

  return games;
}
