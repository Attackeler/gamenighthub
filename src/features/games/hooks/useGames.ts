import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { Game } from '../types';

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    const fetchGames = async () => {
      if (db) {
        const snapshot = await getDocs(collection(db, 'games'));
        const data = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as Game))
          .sort((a, b) => {
            const rankA =
              typeof a.rank === 'number' && Number.isFinite(a.rank) ? a.rank : Number.POSITIVE_INFINITY;
            const rankB =
              typeof b.rank === 'number' && Number.isFinite(b.rank) ? b.rank : Number.POSITIVE_INFINITY;

            if (rankA !== rankB) {
              return rankA - rankB;
            }

            return (a.name ?? '').localeCompare(b.name ?? '');
          });
        setGames(data);
      }
    };

    fetchGames();
  }, []);

  return games;
}

