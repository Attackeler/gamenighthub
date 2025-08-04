// src/screens/HomeScreen.styles.ts
import { StyleSheet } from 'react-native';

export const gamesScreenStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centeredContainer: {
    width: '96%',
    maxWidth: 980, // Adjust as needed
    alignSelf: 'center',
  },
  divider: {
    height: 2,
    width: '100%',
    marginBottom: 18,
    marginTop: 0,
  },
  contentWrapper: {
    width: '100%',
  },
  text: {
    fontWeight: 'bold',
                textAlign: 'left',
                marginBottom: 12,
                marginLeft: 10
  }
});
