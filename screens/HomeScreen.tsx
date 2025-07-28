// src/screens/HomeScreen.tsx
import CreateGameNightModal from '@/components/CreateGameNightModal';
import Header from '@/components/Header';
import Section from '@/components/Section';
import ActiveGameNightCard from '@/components/sections/ActiveGameNightCard';
import { AppTheme } from '@/themes/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text, useTheme, TouchableRipple } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

type GameNight = {
  id: number;
  title: string;
  date: string;
  location: string;
  members: string[];
};
const STORAGE_KEY = 'game_nights';

export default function HomeScreen() {
  const theme = useTheme<AppTheme>();
  const [modalVisible, setModalVisible] = useState(false);
  const [gameNights, setGameNights] = useState<GameNight[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        setGameNights(JSON.parse(data));
      }
    });
  }, []);
  const saveGameNights = async (nights: GameNight[]) => {
    setGameNights(nights);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nights));
  };
  const handleCreateGameNight = () => {
    const newId = gameNights.length + 1;
    const newNight: GameNight = {
      id: newId,
      title: `Game Night #${newId}`,
      date: new Date().toLocaleString(),
      location: 'New Location',
      members: [
        `https://i.pravatar.cc/40?u=${newId}`,
        `https://i.pravatar.cc/40?u=${newId + 1}`,
      ],
    };
    const updated = [...gameNights, newNight];
    saveGameNights(updated);
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
        <View style={{ width: '100%', maxWidth: 700, paddingHorizontal: 16, paddingVertical: 10 }}>
          <Header />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
            <TouchableRipple
              onPress={() => { setModalVisible(false); handleCreateGameNight(); }}
              rippleColor="rgba(255,255,255,0.3)"
              borderless={false}
              style={{
                flex: 1,
                overflow: 'hidden',
                borderRadius: 16,
                marginRight: 8,
                backgroundColor: theme.colors.primary,
                paddingVertical: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <MaterialCommunityIcons name="plus" size={20} color="white" />
                <Text
                  selectable={false}
                  style={{
                    color: theme.colors.onCreateButton,
                    marginTop: 4,
                    fontWeight: '600',
                    userSelect: 'none',
                  }}
                >
                  Create Game Night
                </Text>
              </View>
            </TouchableRipple>

            <TouchableRipple
              onPress={() => { }}
              rippleColor="rgba(0,0,0,0.1)"
              borderless={false}
              style={{
                flex: 1,
                overflow: 'hidden',
                borderRadius: 16,
                marginLeft: 8,
                backgroundColor: theme.colors.secondary,
                paddingVertical: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <MaterialCommunityIcons
                  name="account-multiple-plus"
                  size={20}
                  color={theme.colors.onJoinButton}
                />
                <Text
                  selectable={false}
                  style={{
                    color: theme.colors.onJoinButton,
                    marginTop: 4,
                    fontWeight: '600',
                    userSelect: 'none',
                  }}
                >
                  Join Room
                </Text>
              </View>
            </TouchableRipple>
          </View>

          <Section title="Active Game Nights" actionLabel="See All" onActionPress={() => { }} />

          <ScrollView
            contentContainerStyle={{ paddingVertical: 8 }}
            style={{  maxWidth: '100%', height: 400 }}
          >
            {gameNights.map((gn) => (
              <View key={gn.id} style={{ marginRight: 12 }}>
                <ActiveGameNightCard
                  title={gn.title}
                  date={gn.date}
                  location={gn.location}
                  members={gn.members}
                  onMessagePress={() => console.log('message')}
                  onViewPress={() => console.log('view')}
                  onDeletePress={() => {
                    const updated = gameNights.filter((item) => item.id !== gn.id);
                    setGameNights(updated);
                    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                  }}
                />
              </View>
            ))}
          </ScrollView>


          <Section title="Popular Games" actionLabel="See All" onActionPress={() => { }} />
          <Text>Test</Text>

          <Section title="Recent Activity" actionLabel="See All" onActionPress={() => { }} />
          <Text>Test</Text>
        </View>
      </ScrollView>

      <CreateGameNightModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        onCreate={() => {
          handleCreateGameNight();
          setModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}
