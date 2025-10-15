import createIconSet from '@expo/vector-icons/build/createIconSet';
import glyphMap from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json';

const asset = require('../../../assets/fonts/Ionicons.ttf');

const Ionicons = createIconSet(glyphMap, 'ionicons', asset);

export type IoniconsIconName = keyof typeof glyphMap;

export default Ionicons;
