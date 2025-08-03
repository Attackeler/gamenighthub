import { StyleSheet } from 'react-native';

export const gameCardStyles = StyleSheet.create({
  cardHome: {
    width: 160,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardGames: {
    width: '100%',
    maxWidth: 1000,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 100,
    marginTop: 16,
  },
  content: {
  flex: 1,
  width: '96%',
  maxWidth: 980,
  paddingHorizontal: 12,
  paddingVertical: 10,
  justifyContent: 'space-between',
},
  name: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconText: {
    marginLeft: 6,
  },
});
