// src/screens/HomeScreen.tsx
import CreateGameNightModal from '@/components/game/GameNightModal/CreateGameNightModal';
import GameCard from '@/components/game/GameCard/GameCard';
import Section from '@/components/shared/Section/Section';
import ActiveGameNightCard from '@/components/sections/ActiveGameNightCard/ActiveGameNightCard';
import NoGameNightCard from '@/components/sections/NoGameNightCard/NoGameNightCard';
import { AppTheme } from '@/themes/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text, useTheme, TouchableRipple } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';
import { GameNight } from './HomeScreen.types';
import { useGameNights } from './HomeScreen.hooks';
import { useGames } from '@/hooks/useGames';
import { homeScreenStyles } from './HomeScreen.styles';

export default function HomeScreen() {
  const theme = useTheme<AppTheme>();
  const [modalVisible, setModalVisible] = useState(false);
  const { gameNights, saveGameNights } = useGameNights();
  const games = useGames();

  const handleCreateGameNight = () => {
    const newId = uuidv4();
    const newNight: GameNight = {
      id: newId,
      title: `Game Night ${gameNights.length + 1}`,
      date: new Date().toLocaleString(),
      location: 'New Location',
      members: [
        `https://i.pravatar.cc/40?u=${newId}-1`,
        `https://i.pravatar.cc/40?u=${newId}-2`,
      ],
    };
    const updated = [...gameNights, newNight];
    saveGameNights(updated);
  };

  const handleDeleteGameNight = (id: string) => {
    const updated = gameNights.filter((item) => item.id !== id);
    saveGameNights(updated);
  };

  return (
    <View style={[homeScreenStyles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
        <View style={homeScreenStyles.contentWrapper}>
          <View style={homeScreenStyles.buttonRow}>
            <TouchableRipple
              onPress={() => setModalVisible(true)}
              rippleColor="rgba(255,255,255,0.3)"
              style={[
                homeScreenStyles.button,
                homeScreenStyles.buttonLeft,
                {
                  backgroundColor: theme.colors.primary
                },
              ]}
            >
              <View style={{ alignItems: 'center' }}>
                <MaterialCommunityIcons name="plus" size={20} color="white" />
                <Text style={[homeScreenStyles.text, { color: theme.colors.onCreateButton }]}>
                  Create Game Night
                </Text>
              </View>
            </TouchableRipple>

            <TouchableRipple
              onPress={() => { }}
              rippleColor="rgba(0,0,0,0.1)"
              style={[
                homeScreenStyles.button,
                homeScreenStyles.buttonRight,
                { backgroundColor: theme.colors.secondary},
              ]}
            >
              <View style={{ alignItems: 'center' }}>
                <MaterialCommunityIcons name="account-multiple-plus" size={20} color={theme.colors.onJoinButton} />
                <Text style={[homeScreenStyles.text, { color: theme.colors.onJoinButton }]}>
                  Join Room
                </Text>
              </View>
            </TouchableRipple>
          </View>

          <Section title="Active Game Nights" actionLabel="See All" onActionPress={() => { }} />

          {gameNights.length === 0 ? (
            <NoGameNightCard onCreatePress={() => setModalVisible(true)} />
          ) : (
            <ScrollView contentContainerStyle={{ paddingVertical: 8 }} style={[homeScreenStyles.cardScroll]} >
              {gameNights.map((gn) => (
                <View key={gn.id} style={[homeScreenStyles.cardItem]}>
                  <ActiveGameNightCard
                    title={gn.title}
                    date={gn.date}
                    location={gn.location}
                    members={gn.members}
                    onMessagePress={() => console.log('message')}
                    onViewPress={() => console.log('view')}
                    onDeletePress={() => handleDeleteGameNight(gn.id)}
                  />
                </View>
              ))}
            </ScrollView>
          )}

          <Section title="Popular Games" actionLabel="See All" onActionPress={() => { }} />
          <ScrollView horizontal>
            {games.map((game) => (
              <GameCard key={game.id} game={game} page='Home' />
            ))}
          </ScrollView>
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
    </View>
  );
}
