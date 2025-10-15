import GamesScreen from '@/features/games/screens/games/GamesScreen';
import HomeScreen from '@/features/home/screens/home/HomeScreen';
import FriendsScreen from '@/features/friends/screens/FriendsScreen';
import ProfileScreen from '@/features/profile/screens/ProfileScreen';
import PlaceholderScreen from '@/shared/screens/PlaceholderScreen';

export const tabs = [
  { name: 'home', component: HomeScreen },
  { name: 'games', component: GamesScreen },
  { name: 'friends', component: FriendsScreen },
  { name: 'stats', component: PlaceholderScreen },
  { name: 'profile', component: ProfileScreen },
];
