// src/screens/HomeScreen.tsx
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const theme = useTheme(); // ✅ correctly placed

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
          <Button
            mode="contained"
            onPress={() => {}}
            style={{ flex: 1, marginRight: 8 }}
          >
            Create Game Night
          </Button>
          <Button
            mode="contained"
            buttonColor={theme.colors.secondary}
            textColor={theme.dark ? 'white' : 'black'}
            onPress={() => {}}
            style={{ flex: 1, marginLeft: 8 }}
          >
            Join Room
          </Button>
        </View>

        <Text variant="titleMedium" style={{ marginBottom: 8 }}>
          Active Game Nights
        </Text>

        <Text variant="titleMedium" style={{ marginTop: 24, marginBottom: 8 }}>
          Popular Games
        </Text>

        <Text variant="titleMedium" style={{ marginTop: 24, marginBottom: 8 }}>
          Recent Activity
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
