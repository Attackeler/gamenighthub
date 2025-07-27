// src/screens/HomeScreen.tsx
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import { AppTheme } from '@/themes/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const theme = useTheme<AppTheme>();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} >
      <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
        <View style={{ width: '100%', maxWidth: 700, paddingHorizontal: 16, paddingVertical: 10 }}>
          <Header />
          {/* Buttons for creating or joining game nights */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
            <Button
              mode="contained"
              onPress={() => { }}
              style={{ flex: 1, marginRight: 8, borderRadius: 16, paddingVertical: 10 }}
              contentStyle={{ flexDirection: 'column', alignItems: 'center' }}
            >
              <View style={{ alignItems: 'center' }}>
                <MaterialCommunityIcons name="plus" size={20} color={theme.colors.onCreateButton} style={{ marginBottom: 4 }} />
                <Text style={{ color: theme.colors.onCreateButton, fontWeight: 'bold' }}>Create Game Night</Text>
              </View>
            </Button>
            <Button
              mode="contained"
              buttonColor={theme.colors.secondary}
              textColor={theme.dark ? 'white' : 'black'}
              onPress={() => { }}
              style={{ flex: 1, marginLeft: 8, borderRadius: 16, paddingVertical: 10 }}
              contentStyle={{ flexDirection: 'column', alignItems: 'center' }}
            >
              <View style={{ alignItems: 'center' }}>
                <MaterialCommunityIcons
                  name="account-multiple-plus"
                  size={20}
                  color={theme.colors.onJoinButton}
                  style={{ marginBottom: 4 }}
                />
                <Text style={{ color: theme.colors.onJoinButton, fontWeight: 'bold' }}>Join Room</Text>
              </View>
            </Button>
          </View>
          {/* Sections for active game nights, popular games and recent activity */}
          <Modal title="Active Game Nights" actionLabel="See All" onActionPress={() => {}}>
            <Text>Test</Text>
          </Modal>
          {/* <Text variant="titleMedium" style={{ marginTop: 24, marginBottom: 8, fontWeight: 'bold' }}>
            Popular Games
          </Text> */}
          <Modal title="Popular Games" actionLabel="See All" onActionPress={() => {}}>
            <Text>Test</Text>
          </Modal>

          <Modal title="Recent Activity" actionLabel="See All" onActionPress={() => {}}>
            <Text>Test</Text>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView >
  );
}
