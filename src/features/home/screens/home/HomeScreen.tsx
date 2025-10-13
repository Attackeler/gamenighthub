import React, { useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';

import CreateGameNightModal, {
  CreateGameNightFormValues,
} from '@/features/games/components/game-night-modal/CreateGameNightModal';
import GameCard from '@/features/games/components/game-card/GameCard';
import { useGames } from '@/features/games/hooks/useGames';
import ActiveGameNightCard from '@/features/home/components/active-game-night-card/ActiveGameNightCard';
import NoGameNightCard from '@/features/home/components/no-game-night-card/NoGameNightCard';
import { useGameNights } from '@/features/home/hooks/useGameNights';
import Section from '@/shared/components/section/Section';
import { AppTheme } from '@/app/theme/types';
import { homeScreenStyles } from './HomeScreen.styles';
import type { TabParamList } from './HomeScreen.types';
import type { GameNight } from './HomeScreen.types';

const getMaxScrollableItems = () => (Platform.OS === 'web' ? 3 : 2);

export default function HomeScreen() {
  const theme = useTheme<AppTheme>();
  const styles = homeScreenStyles(theme);

  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const [modalVisible, setModalVisible] = useState(false);
  const { gameNights, saveGameNights } = useGameNights();
  const games = useGames();

  const addTemplateGameNight = () => {
    const newNight: GameNight = {
      id: createGameNightId(),
      title: 'Debug Night',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: 'Debug Arena',
      members: [
        'https://i.pravatar.cc/40?u=debug-1',
        'https://i.pravatar.cc/40?u=debug-2',
      ],
      invitedFriends: [
        { id: 1, name: 'Debugger Dan', email: 'dan@debug.com' },
        { id: 2, name: 'Testy Tina', email: 'tina@test.com' },
      ],
      selectedGames: [
        { id: 1, name: 'Activity', duration: '45-75 min', players: '3-16 players' },
        { id: 2, name: 'Catan', duration: '60-90 min', players: '3-4 players' },
      ],
    };
    saveGameNights([...gameNights, newNight]);
  };

  const handleCreateGameNight = (values: CreateGameNightFormValues) => {
    const newId = createGameNightId();
    const members = values.invitedFriends.map((friend, index) => {
      const uniqueKey = friend.email || `${friend.name}-${index}`;
      return `https://i.pravatar.cc/40?u=${encodeURIComponent(uniqueKey)}`;
    });

    const newNight: GameNight = {
      id: newId,
      title: values.title,
      date: values.date,
      time: values.time,
      location: values.location,
      members,
      invitedFriends: values.invitedFriends,
      selectedGames: values.selectedGames,
    };
    const updated = [...gameNights, newNight];
    saveGameNights(updated);
  };

  const handleDeleteGameNight = (id: string) => {
    const updated = gameNights.filter((item) => item.id !== id);
    saveGameNights(updated);
  };

  const shouldScrollActiveCards = gameNights.length > getMaxScrollableItems();

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.alignCenter} nestedScrollEnabled>
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
                <Text style={[styles.text, { color: theme.colors.onJoinButton }]}>
                  Join Room
                </Text>
              </View>
            </TouchableRipple>
          </View>

          <View style={styles.debugButtonRow}>
            <TouchableRipple
              onPress={addTemplateGameNight}
              rippleColor={theme.colors.rippleCreate}
              style={[styles.button, styles.debugButton]}
            >
              <View style={styles.alignCenter}>
                <MaterialCommunityIcons name="beaker-plus" size={20} style={styles.icon} />
                <Text style={[styles.text, { color: theme.colors.onCreateButton }]}>
                  Add Template Night
                </Text>
              </View>
            </TouchableRipple>
          </View>

          <Section title="Active Game Nights" actionLabel="See All" onActionPress={() => {}} />

          {gameNights.length === 0 ? (
            <NoGameNightCard onCreatePress={() => setModalVisible(true)} />
          ) : (
            <View
              style={[
                styles.activeCardsContainer,
                shouldScrollActiveCards && styles.activeCardsScrollable,
              ]}
            >
              <ScrollView
                style={styles.activeCardsList}
                contentContainerStyle={styles.activeCardsContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                scrollEnabled={shouldScrollActiveCards}
              >
                {gameNights.map((item) => (
                  <View key={item.id} style={styles.cardItem}>
                    <ActiveGameNightCard
                      title={item.title}
                      date={item.date}
                      time={item.time}
                      location={item.location}
                      members={item.members ?? []}
                      invitedFriends={item.invitedFriends ?? []}
                      selectedGames={item.selectedGames ?? []}
                      onMessagePress={() => console.log('message')}
                      onViewPress={() => console.log('view')}
                      onDeletePress={() => handleDeleteGameNight(item.id)}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <Section
            title="Popular Games"
            actionLabel="See All"
            onActionPress={() => navigation.navigate('games')}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
        onCreate={(formValues) => {
          handleCreateGameNight(formValues);
        }}
      />
    </View>
  );
}

const createGameNightId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
