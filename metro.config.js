// @ts-check
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;

/** @type {import('metro-config').ExpoMetroConfig} */
const config = getDefaultConfig(projectRoot);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  '@expo/vector-icons/MaterialCommunityIcons': path.resolve(
    projectRoot,
    'src/shared/icons/MaterialCommunityIcons.ts',
  ),
  '@expo/vector-icons/Ionicons': path.resolve(
    projectRoot,
    'src/shared/icons/Ionicons.ts',
  ),
};

config.resolver.alias = {
  ...(config.resolver.alias ?? {}),
  '@expo/vector-icons/MaterialCommunityIcons': path.resolve(
    projectRoot,
    'src/shared/icons/MaterialCommunityIcons.ts',
  ),
  '@expo/vector-icons/Ionicons': path.resolve(
    projectRoot,
    'src/shared/icons/Ionicons.ts',
  ),
};

module.exports = config;
