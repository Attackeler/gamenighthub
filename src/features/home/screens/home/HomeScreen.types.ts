import type {
  FriendOption,
  GameOption,
} from '@/features/games/components/game-night-modal/mockData';

export type GameNight = {
  id: string;
  ownerId: string;
  ownerName?: string;
  ownerPhotoURL?: string | null;
  title: string;
  date: string;
  time?: string;
  location: string;
  members: string[];
  invitedFriends: FriendOption[];
  invitedFriendIds: string[];
  acceptedFriendIds: string[];
  selectedGames: GameOption[];
  status: "draft" | "pending" | "accepted" | "cancelled";
  createdAt?: string;
  updatedAt?: string;
};

export type TabParamList = {
  home: undefined;
  games: undefined;
  // ...other tabs
};
