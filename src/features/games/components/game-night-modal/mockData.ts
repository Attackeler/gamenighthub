export type GameOption = {
  id: string;
  name: string;
  duration: string;
  players: string;
};

export type FriendOption = {
  id: string;
  name: string;
  email: string;
  friendCode?: string;
  photoURL?: string | null;
};

export const games: GameOption[] = [
  { id: 'activity', name: 'Activity', duration: '45-75 min', players: '3-16 players' },
  { id: 'catan', name: 'Catan', duration: '60-90 min', players: '3-4 players' },
  { id: 'monopoly', name: 'Monopoly', duration: '120-240 min', players: '2-8 players' },
];

export const friends: FriendOption[] = [];
