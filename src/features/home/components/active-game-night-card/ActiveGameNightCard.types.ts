import type {
  FriendOption,
  GameOption,
} from '@/features/games/components/game-night-modal/mockData';

export type ActiveGameNightCardProps = {
  title: string;
  date: string;
  time?: string;
  location: string;
  members: string[]; // avatar URLs
  invitedFriends: FriendOption[];
  selectedGames: GameOption[];
  onMessagePress?: () => void;
  onViewPress?: () => void;
  onDeletePress: () => void;
};
