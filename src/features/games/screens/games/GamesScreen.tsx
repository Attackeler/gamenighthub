import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import GameCard from '@/features/games/components/game-card/GameCard';
import { useGames } from '@/features/games/hooks/useGames';
import { AppTheme } from '@/app/theme/types';

import { gamesScreenStyles } from './GamesScreen.styles';

export default function GamesScreen() {
  const theme = useTheme<AppTheme>();
  const games = useGames();

  return (
    <View style={[gamesScreenStyles.root, { backgroundColor: theme.colors.background }]}
    >
      <View style={gamesScreenStyles.centeredContainer}>
        <ScrollView>
          <View style={gamesScreenStyles.contentWrapper}>
            <Text variant="titleLarge" style={gamesScreenStyles.text}>
              Games
            </Text>
            {games.map((game) => (
              <GameCard key={game.id} game={game} page="Games" />
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
