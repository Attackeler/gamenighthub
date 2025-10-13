export type Game = {
  id: string;
  name: string;
  description?: string;
  picture: string | number;
  duration: string;
  players: string;
  category: string;
  difficulty: string;
};

export type GameCardPage = 'Home' | 'Games';
