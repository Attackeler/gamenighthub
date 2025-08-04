// src/screens/HomeScreen.styles.ts
import { StyleSheet } from 'react-native';
import { AppTheme } from '@/themes/types';

export const homeScreenStyles = (theme: AppTheme) => StyleSheet.create({
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
    color: theme.colors.onCreateButton, // or onJoinButton, use in TSX
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
  cardScroll: {
    width: '100%',
    paddingHorizontal: 0,
  },
  cardItem: {
    marginBottom: 12,
  },
  sectionScroll: {
    paddingVertical: 8,
  },
});
