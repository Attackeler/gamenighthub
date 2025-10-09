import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { v4 as uuidv4 } from 'uuid';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';

import CreateGameNightModal from '@/features/games/components/game-night-modal/CreateGameNightModal';
import GameCard from '@/features/games/components/game-card/GameCard';
import { useGames } from '@/features/games/hooks/useGames';
import ActiveGameNightCard from '@/features/home/components/active-game-night-card/ActiveGameNightCard';
import NoGameNightCard from '@/features/home/components/no-game-night-card/NoGameNightCard';
import { AppTheme } from '@/app/theme/types';
import Section from '@/shared/ui/section/Section';

import { useGameNights } from './HomeScreen.hooks';
import { homeScreenStyles } from './HomeScreen.styles';
import { GameNight, TabParamList } from './HomeScreen.types';

export default function HomeScreen() {
  const theme = useTheme<AppTheme>();
  const styles = homeScreenStyles(theme);
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
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
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.alignCenter}>
        <View style={styles.contentWrapper}>
          <View style={styles.buttonRow}>
            <TouchableRipple
              onPress={() => setModalVisible(true)}
              rippleColor={theme.colors.rippleCreate}
              style={[styles.button, styles.buttonLeft]}
            >
              <View style={styles.alignCenter}>
                <MaterialCommunityIcons name="plus" size={20} style={styles.icon} />
                <Text style={[styles.text, { color: theme.colors.onCreateButton }]}>
                  Create Game Night
                </Text>
              </View>
            </TouchableRipple>
            <TouchableRipple
              onPress={() => {}}
              rippleColor={theme.colors.rippleJoin}
              style={[styles.button, styles.buttonRight]}
            >
              <View style={styles.alignCenter}>
                <MaterialCommunityIcons name="account-multiple-plus" size={20} style={styles.iconJoin} />
                <Text style={[styles.text, { color: theme.colors.onJoinButton }]}>Join Room</Text>
              </View>
            </TouchableRipple>
          </View>
          <Section title="Active Game Nights" actionLabel="See All" onActionPress={() => {}} />
          {gameNights.length === 0 ? (
            <NoGameNightCard onCreatePress={() => setModalVisible(true)} />
          ) : (
            <ScrollView contentContainerStyle={styles.sectionScroll} style={styles.cardScroll}>
              {gameNights.map((gn) => (
                <View key={gn.id} style={styles.cardItem}>
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
          <Section
            title="Popular Games"
            actionLabel="See All"
            onActionPress={() => navigation.navigate('games')}
          />
          <ScrollView horizontal>
            {games.map((game) => (
              <GameCard key={game.id} game={game} page="Home" />
            ))}
          </ScrollView>
          <Section title="Recent Activity" actionLabel="See All" onActionPress={() => {}} />
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
