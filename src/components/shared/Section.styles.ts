import { StyleSheet } from 'react-native';

export const sectionStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  actionLabel: {
    fontWeight: '600',
  },
});
