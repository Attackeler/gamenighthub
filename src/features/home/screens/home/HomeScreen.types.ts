import type {
  FriendOption,
  GameOption,
} from '@/features/games/components/game-night-modal/mockData';

export type GameNight = {
  id: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  members: string[];
  invitedFriends: FriendOption[];
  selectedGames: GameOption[];
};

export type TabParamList = {
  home: undefined;
  games: undefined;
  // ...other tabs
};
