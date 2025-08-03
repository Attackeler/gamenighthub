import HomeScreen from '../../screens/HomeScreen/HomeScreen';
import PlaceholderScreen from '../../screens/PlaceholderScreen';
import GameCardScreen from '../../screens/GamesScreen/GamesScreen';
export const tabs = [
  { name: 'Home', component: HomeScreen },
  { name: 'Games', component: GameCardScreen },
  { name: 'Friends', component: PlaceholderScreen },
  { name: 'Stats', component: PlaceholderScreen },
  { name: 'Profile', component: PlaceholderScreen },
];
