// hooks/useGames.ts
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase'; 
export type Game = {
  id: string;
  name: string;
  description: string;
  duration: string;
  players: string;
  picture: string;
};

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    const fetchGames = async () => {
      if (db) {
        const snapshot = await getDocs(collection(db, 'games'));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Game));
        setGames(data);
      }
    };

    fetchGames();
  }, []);

  return games;
}
