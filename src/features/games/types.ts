export type Game = {
  id: string;
  bggId?: number;
  name: string;
  description?: string;
  picture: string | number;
  duration: string;
  players: string;
  category: string;
  difficulty: string;
  rank?: number | null;
  minPlayers?: number | null;
  maxPlayers?: number | null;
};

export type GameCardPage = 'Home' | 'Games';
