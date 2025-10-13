import { Platform, StyleSheet, ViewStyle } from 'react-native';

import { AppTheme } from '@/app/theme/types';

const WEB_VISIBLE_CARDS = 3;
const NATIVE_VISIBLE_CARDS = 2;
const ACTIVE_CARD_APPROX_HEIGHT = 185;
const WEB_PARTIAL_CARD_OFFSET = 0.35;

export const homeScreenStyles = (theme: AppTheme) => {
  const visibleCardCount =
    Platform.OS === 'web'
      ? WEB_VISIBLE_CARDS + WEB_PARTIAL_CARD_OFFSET
      : NATIVE_VISIBLE_CARDS;
  const maxListHeight = visibleCardCount * ACTIVE_CARD_APPROX_HEIGHT;

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentWrapper: {
      width: '100%',
      maxWidth: 1000,
      alignSelf: 'center',
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 16,
      gap: 16,
    },
    button: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 12,
      marginHorizontal: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonLeft: {
      backgroundColor: theme.colors.primary,
    },
    buttonRight: {
      backgroundColor: theme.colors.secondary,
    },
    icon: {
      color: theme.colors.onCreateButton,
    },
    iconJoin: {
      color: theme.colors.onJoinButton,
    },
    text: {
      fontWeight: 'bold',
      fontSize: 15,
    },
    alignCenter: {
      alignItems: 'center',
    },
    activeCardsContainer: {
      width: '100%',
    },
    activeCardsScrollable: {
      maxHeight: maxListHeight,
      overflow: 'hidden',
    },
    activeCardsList: {
      width: '100%',
      ...(Platform.OS === 'web'
        ? ({
            paddingRight: 12,
            marginRight: -12,
            scrollbarWidth: 'none',
          } as unknown as ViewStyle)
        : {}),
    },
    activeCardsContent: {
      paddingVertical: 8,
    },
    cardItem: {
      marginBottom: 12,
      minHeight: ACTIVE_CARD_APPROX_HEIGHT,
    },
    debugButtonRow: {
      width: '100%',
      marginBottom: 16,
    },
    debugButton: {
      backgroundColor: theme.colors.primary,
    },
  });
};
