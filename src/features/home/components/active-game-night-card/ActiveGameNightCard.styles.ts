import { StyleSheet } from 'react-native';

export const activeCardStyles = StyleSheet.create({
  card: {
    marginBottom: 12,
    paddingHorizontal: 0,
  },
  content: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  locationRow: {
    marginBottom: 12,
  },
  gamesRow: {
    marginBottom: 12,
    alignItems: 'center',
    gap: 8,
  },
  selectedGamesChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
    alignItems: 'center',
    minHeight: 32,
  },
  gamesRowIcon: {
    alignSelf: 'center',
  },
  selectedGameChip: {
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
  },
  selectedGameChipText: {
    fontSize: 12,
    lineHeight: 16,
  },
  invitedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: -8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  invitedLabel: {
    marginLeft: 12,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    alignItems: 'center',
  },
});


