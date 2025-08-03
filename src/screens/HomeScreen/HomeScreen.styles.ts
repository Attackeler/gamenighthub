// src/screens/HomeScreen.styles.ts
import { StyleSheet } from 'react-native';

export const homeScreenStyles = StyleSheet.create({
    root: {
        flex: 1,
    },
    scrollContainer: {
        alignItems: 'center',
    },
    contentWrapper: {
        width: '90%',
        maxWidth: 960,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        borderRadius: 16,
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonLeft: {
        marginRight: 8,
    },
    buttonRight: {
        marginLeft: 8,
    },
    cardScroll: {
        width: '100%',
        maxHeight: 400,
    },
    cardItem: {
        marginRight: 12,
    },
    horizontalGameScroll: {
        marginTop: 8,
    },
    text: {
        marginTop: 4,
        fontWeight: '600',
    }
});
