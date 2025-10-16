import { Platform, StyleSheet } from 'react-native';

import { AppTheme } from '@/app/theme/types';
import { hexToRgba } from '@/shared/utils/color';

export const gameCardStyles = (theme: AppTheme) => StyleSheet.create({
  cardHome: {
    width: 160,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 220,
  },
  cardGames: {
    width: '100%',
    maxWidth: 1000,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'stretch',
    marginLeft: 0,
    marginRight: 0,
  },
  image: {
    width: '100%',
    height: 100,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceVariant ?? theme.colors.surface,
  },
  imageGames: {
    width: 96,
    height: 96,
    borderRadius: 8,
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surfaceVariant ?? theme.colors.surface,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 1000,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  contentGames: {
    flex: 1,
    width: '100%',
    maxWidth: 1000,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  cardContentGames: {
    position: 'relative',
    width: '100%',
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 6,
    minHeight: 40,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconText: {
    marginLeft: 6,
  },
  rowGames: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  infoGames: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  headerGames: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameGames: {
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 12,
    flex: 1,
    paddingRight: 96,
  },
  difficultyGames: {
    fontSize: 13,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
    overflow: 'hidden',
    textAlign: 'center',
    minWidth: 48,
  },
  difficultyEasyGames: {
    backgroundColor: theme.colors.difficultyEasyBg,
    color: theme.colors.difficultyEasyText,
  },
  difficultyMediumGames: {
    backgroundColor: theme.colors.difficultyMediumBg,
    color: theme.colors.difficultyMediumText,
  },
  difficultyHardGames: {
    backgroundColor: theme.colors.difficultyHardBg,
    color: theme.colors.difficultyHardText,
  },
  difficultyBadgeContainerGames: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 2,
  },
  descriptionGames: {
    marginBottom: 6,
    marginTop: 2,
  },
  descriptionToggleWrapper: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  descriptionToggleText: {
    fontWeight: '600',
    fontSize: 13,
  },
  metaGames: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginBottom: 8,
  },
  metaItemGames: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaTextGames: {
    marginLeft: 4,
  },
  tagsGames: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  tagGames: {
    fontSize: 13,
    fontWeight: '500',
    backgroundColor: theme.colors.categoryBg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.categoryBorder,
    color: theme.colors.categoryText,
    overflow: 'hidden',
    ...(Platform.select({
      web: {
        boxShadow: `0 4px 16px ${hexToRgba(theme.colors.categoryShadow, 0.25)}`,
      },
      default: {
        shadowColor: theme.colors.categoryShadow,
        shadowOffset: { width: 0, height: 4 }, // stronger shadow
        shadowOpacity: 0.25, // more visible
        shadowRadius: 8, // softer edge
        elevation: 4, // for Android
      },
    }) ?? {}),
  },
});
