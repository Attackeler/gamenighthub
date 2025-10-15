export type GameOption = {
  id: string;
  name: string;
  duration: string;
  players: string;
};

export type FriendOption = {
  id: number;
  name: string;
  email: string;
};

export const games: GameOption[] = [
  { id: 'activity', name: 'Activity', duration: '45-75 min', players: '3-16 players' },
  { id: 'catan', name: 'Catan', duration: '60-90 min', players: '3-4 players' },
  { id: 'monopoly', name: 'Monopoly', duration: '120-240 min', players: '2-8 players' },
];

export const friends: FriendOption[] = [
  { id: 1, name: 'teo', email: 'teo@teo.com' },
  { id: 2, name: 'test', email: 'test@test.com' },
];
