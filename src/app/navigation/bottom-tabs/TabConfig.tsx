import GamesScreen from '@/features/games/screens/games/GamesScreen';
import HomeScreen from '@/features/home/screens/home/HomeScreen';
import PlaceholderScreen from '@/shared/screens/PlaceholderScreen';

export const tabs = [
  { name: 'home', component: HomeScreen },
  { name: 'games', component: GamesScreen },
  { name: 'friends', component: PlaceholderScreen },
  { name: 'stats', component: PlaceholderScreen },
  { name: 'profile', component: PlaceholderScreen },
];
