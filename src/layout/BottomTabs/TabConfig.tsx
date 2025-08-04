import HomeScreen from '../../screens/HomeScreen/HomeScreen';
import PlaceholderScreen from '../../screens/PlaceholderScreen';
import GameCardScreen from '../../screens/GamesScreen/GamesScreen';
export const tabs = [
  { name: 'home', component: HomeScreen },
  { name: 'games', component: GameCardScreen },
  { name: 'friends', component: PlaceholderScreen },
  { name: 'stats', component: PlaceholderScreen },
  { name: 'profile', component: PlaceholderScreen },
];
