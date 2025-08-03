import { StyleSheet } from 'react-native';

export const gameCardStyles = StyleSheet.create({
  card: {
    width: 160,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 100,
    marginTop: 16,
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 10,
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
