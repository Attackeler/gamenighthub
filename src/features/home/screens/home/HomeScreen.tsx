import React, { useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { MaterialCommunityIcons } from '@/shared/icons';
import { Button, Card, IconButton, Text, TouchableRipple, useTheme } from 'react-native-paper';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';

import CreateGameNightModal, {
  CreateGameNightFormValues,
} from '@/features/games/components/game-night-modal/CreateGameNightModal';
import GameCard from '@/features/games/components/game-card/GameCard';
import { useGames } from '@/features/games/hooks/useGames';
import type { Game } from '@/features/games/types';
import ActiveGameNightCard from '@/features/home/components/active-game-night-card/ActiveGameNightCard';
import NoGameNightCard from '@/features/home/components/no-game-night-card/NoGameNightCard';
import { useGameNights } from '@/features/home/hooks/useGameNights';
import Section from '@/shared/components/section/Section';
import { AppTheme } from '@/app/theme/types';
import { homeScreenStyles } from './HomeScreen.styles';
import type { TabParamList } from './HomeScreen.types';

const getMaxScrollableItems = () => (Platform.OS === 'web' ? 3 : 2);
const CARD_WIDTH = 180;
const CARD_GAP = 12;

const FALLBACK_TOP_IDS = [
  174430, // Gloomhaven
  161936, // Pandemic Legacy: Season 1
  224517, // Brass: Birmingham
  167791, // Terraforming Mars
  233078, // Twilight Imperium: Fourth Edition
  106662, // Star Wars: Rebellion
  182028, // Through the Ages: A New Story of Civilization
  115746, // War of the Ring (Second Edition)
  220308, // Gaia Project
  162886, // Spirit Island
];

export default function HomeScreen() {
  const theme = useTheme<AppTheme>();
  const styles = homeScreenStyles(theme);

  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const [modalVisible, setModalVisible] = useState(false);
  const { gameNights, invitations, createNight, acceptInvite, declineInvite, removeNight } = useGameNights();
  const games = useGames();
  const scrollRef = useRef<ScrollView | null>(null);
  const [scrollX, setScrollX] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const isWeb = Platform.OS === 'web';
  const topPopularGames = useMemo(() => {
    const rankedGames = games
      .filter(
        (game): game is Game & { rank: number } =>
          typeof game.rank === 'number' && Number.isFinite(game.rank) && game.rank > 0,
      )
      .sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity))
      .slice(0, 10);

    if (rankedGames.length === 10) {
      return rankedGames;
    }

    const fallbackGames = FALLBACK_TOP_IDS
      .map((bggId) => games.find((game) => (game.bggId ?? Number(game.id)) === bggId))
      .filter((game): game is Game => Boolean(game));

    const combined = [...rankedGames, ...fallbackGames.filter((game) => !rankedGames.some((r) => r.id === game.id))];
    return combined.slice(0, 10);
  }, [games]);

  const handleCreateGameNight = async (values: CreateGameNightFormValues) => {
    try {
      await createNight(values);
      setModalVisible(false);
    } catch (error) {
      console.warn('Failed to create game night', error);
    }
  };

  const handleDeleteGameNight = (id: string) => {
    removeNight(id).catch((error) => {
      console.warn('Failed to delete game night', error);
    });
  };

  const maxScroll = Math.max(contentWidth - containerWidth, 0);
  const canScrollPrev = isWeb && scrollX > 5;
  const canScrollNext = isWeb && scrollX < maxScroll - 5;

  const handleScrollBy = (direction: 1 | -1) => {
    if (!isWeb) return;
    const delta = CARD_WIDTH + CARD_GAP;
    const next = Math.max(0, Math.min(maxScroll, scrollX + direction * delta));
    scrollRef.current?.scrollTo({ x: next, animated: true });
    setScrollX(next);
  };

  const handleScroll = (event: any) => {
    if (!isWeb) return;
    setScrollX(event.nativeEvent.contentOffset.x);
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

          {invitations.length > 0 && (
            <View style={{ width: '100%', marginBottom: 24, gap: 12 }}>
              <Section title="Invitations" />
              {invitations.map((invite) => (
                <Card
                  key={invite.id}
                  mode="outlined"
                  style={{
                    borderRadius: 16,
                    padding: 16,
                    backgroundColor: theme.colors.surface,
                  }}
                >
                  <Text variant="titleMedium" style={{ fontWeight: '600', color: theme.colors.onSurface }}>
                    {invite.title}
                  </Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                    Hosted by {invite.ownerName}
                  </Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                    {invite.date}
                    {invite.time ? ` @ ${invite.time}` : ''}
                  </Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                    {invite.location}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                    <Button
                      mode="contained"
                      onPress={() => {
                        acceptInvite(invite.id).catch((error) => {
                          console.warn('Failed to accept invitation', error);
                        });
                      }}
                      icon="check"
                    >
                      Accept
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => {
                        declineInvite(invite.id).catch((error) => {
                          console.warn('Failed to decline invitation', error);
                        });
                      }}
                      icon="close"
                    >
                      Decline
                    </Button>
                  </View>
                </Card>
              ))}
            </View>
          )}

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

          <View style={styles.popularGamesRow}>
            {isWeb && (
              <IconButton
                icon="chevron-left"
                mode="outlined"
                size={20}
                disabled={!canScrollPrev}
                onPress={() => handleScrollBy(-1)}
                style={styles.carouselButton}
              />
            )}
            <View
              style={styles.carouselScrollWrapper}
              onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
            >
              <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEnabled
                onScroll={handleScroll}
                scrollEventThrottle={16}
                onContentSizeChange={(width) => setContentWidth(width)}
                contentContainerStyle={styles.carouselContent}
              >
                {topPopularGames.map((game, index) => (
                  <View
                    key={game.id}
                    style={{
                      width: CARD_WIDTH,
                      marginRight: index === topPopularGames.length - 1 ? 0 : CARD_GAP,
                    }}
                  >
                    <GameCard game={game} page="Home" />
                  </View>
                ))}
              </ScrollView>
            </View>
            {isWeb && (
              <IconButton
                icon="chevron-right"
                mode="outlined"
                size={20}
                disabled={!canScrollNext}
                onPress={() => handleScrollBy(1)}
                style={styles.carouselButton}
              />
            )}
          </View>

          <Section title="Recent Activity" actionLabel="See All" onActionPress={() => {}} />

        </View>
      </ScrollView>

      <CreateGameNightModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        onCreate={handleCreateGameNight}
      />
    </View>
  );
}


