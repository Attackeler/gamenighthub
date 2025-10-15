import createIconSet from '@expo/vector-icons/build/createIconSet';
import glyphMap from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json';

const asset = require('../../../assets/fonts/MaterialCommunityIcons.ttf');

const MaterialCommunityIcons = createIconSet(glyphMap, 'material-community', asset);

export type MaterialCommunityIconName = keyof typeof glyphMap;

export default MaterialCommunityIcons;
