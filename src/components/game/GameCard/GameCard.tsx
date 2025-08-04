import React from 'react';
import { View, Image } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppTheme } from '@/themes/types';
import { Game, Page } from './GameCard.types';
import { gameCardStyles } from './GameCard.styles';

export default function GameCard({ game, page = 'Home' }: { game: Game, page: Page }) {
  const theme = useTheme<AppTheme>();

  if (page === 'Home' && game) {
  return (
    <Card.Content style={gameCardStyles.content}>
      <Card
        mode="outlined"
        style={[gameCardStyles.cardHome, { backgroundColor: theme.colors.surface }]}>
        <Image
          source={
            typeof game.picture === 'string' && game.picture.startsWith('http')
              ? { uri: game.picture }
              : require('assets/images/adaptive-icon.png') // fallback if local
          }
          resizeMode="contain"
          style={gameCardStyles.image}
        />


        <View style={gameCardStyles.content}>
          <Text variant="bodyMedium" style={gameCardStyles.name}>
            {game.name}
          </Text>

          <View style={gameCardStyles.iconRow}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={14}
              color={theme.colors.onSurfaceVariant}
            />
            <Text variant="bodySmall" style={[gameCardStyles.iconText, { color: theme.colors.onSurfaceVariant }]}>
              {game.duration ? game.duration : 'Missing duration'}
            </Text>
          </View>

          <View style={gameCardStyles.iconRow}>
            <MaterialCommunityIcons
              name="account-group-outline"
              size={14}
              color={theme.colors.onSurfaceVariant}
            />
            <Text variant="bodySmall" style={[gameCardStyles.iconText, { color: theme.colors.onSurfaceVariant }]}>
              {game.players}
            </Text>
          </View>
        </View>
      </Card>
    </Card.Content>
  );
  }
  return (
    <Card.Content style={gameCardStyles.content}>
      <Card
        mode="outlined"
        style={[gameCardStyles.cardGames, { backgroundColor: theme.colors.surface }]}>
        <Image
          source={
            typeof game.picture === 'string' && game.picture.startsWith('http')
              ? { uri: game.picture }
              : require('assets/images/adaptive-icon.png') // fallback if local
          }
          resizeMode="contain"
          style={gameCardStyles.image}
        />


        <View style={gameCardStyles.content}>
          <Text variant="bodyMedium" style={gameCardStyles.name}>
            {game.name}
          </Text>

          <View style={gameCardStyles.iconRow}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={14}
              color={theme.colors.onSurfaceVariant}
            />
            <Text variant="bodySmall" style={[gameCardStyles.iconText, { color: theme.colors.onSurfaceVariant }]}>
              {game.duration ? game.duration : 'Missing duration'}
            </Text>
          </View>

          <View style={gameCardStyles.iconRow}>
            <MaterialCommunityIcons
              name="account-group-outline"
              size={14}
              color={theme.colors.onSurfaceVariant}
            />
            <Text variant="bodySmall" style={[gameCardStyles.iconText, { color: theme.colors.onSurfaceVariant }]}>
              {game.players}
            </Text>
          </View>
        </View>
      </Card>
    </Card.Content>
  
  );
  }
