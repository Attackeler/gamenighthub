import React from 'react';
import { Image, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppTheme } from '@/app/theme/types';
import { Game, GameCardPage } from '@/features/games/types';

import { gameCardStyles } from './GameCard.styles';

type Props = {
  game: Game;
  page?: GameCardPage;
};

export default function GameCard({ game, page = 'Home' }: Props) {
  const theme = useTheme<AppTheme>();
  const styles = gameCardStyles(theme);

  if (page === 'Home' && game) {
    return (
      <Card.Content style={styles.content}>
        <Card
          mode="outlined"
          style={[styles.cardHome, { backgroundColor: theme.colors.surface }]}
        >
          <Image
            source={
              typeof game.picture === 'string' && game.picture.startsWith('http')
                ? { uri: game.picture }
                : require('assets/images/adaptive-icon.png')
            }
            resizeMode="contain"
            style={styles.image}
          />
          <View style={styles.content}>
            <Text variant="bodyMedium" style={styles.name}>
              {game.name}
            </Text>
            <View style={styles.iconRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={14}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="bodySmall" style={[styles.iconText, { color: theme.colors.onSurfaceVariant }]}>
                {game.duration ? game.duration : 'Missing duration'}
              </Text>
            </View>
            <View style={styles.iconRow}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={14}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="bodySmall" style={[styles.iconText, { color: theme.colors.onSurfaceVariant }]}>
                {game.players}
              </Text>
            </View>
          </View>
        </Card>
      </Card.Content>
    );
  }
  if (page === 'Games' && game) {
    return (
      <Card.Content style={styles.contentGames}>
        <Card
          mode="outlined"
          style={[styles.cardGames, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.cardContentGames}>
            {/* Difficulty badge in top right */}
            <View style={styles.difficultyBadgeContainerGames}>
              <Text
                style={[
                  styles.difficultyGames,
                  game.difficulty === 'Easy' && styles.difficultyEasyGames,
                  game.difficulty === 'Medium' && styles.difficultyMediumGames,
                  game.difficulty === 'Hard' && styles.difficultyHardGames,
                ]}
              >
                {game.difficulty?.charAt(0).toUpperCase() + game.difficulty?.slice(1)}
              </Text>
            </View>
            <View style={styles.rowGames}>
              <Image
                source={
                  typeof game.picture === 'string' && game.picture.startsWith('http')
                    ? { uri: game.picture }
                    : require('assets/images/adaptive-icon.png')
                }
                resizeMode="contain"
                style={styles.imageGames}
              />
              <View style={styles.infoGames}>
                <View style={styles.headerGames}>
                  <Text variant="bodyMedium" style={styles.nameGames}>
                    {game.name}
                  </Text>
                </View>
                <Text variant="bodySmall" style={styles.descriptionGames}>
                  {game.description}
                </Text>
                <View style={styles.metaGames}>
                  <View style={styles.metaItemGames}>
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={16}
                      color={theme.colors.onSurfaceVariant}
                    />
                    <Text variant="bodySmall" style={styles.metaTextGames}>
                      {game.duration}
                    </Text>
                  </View>
                  <View style={styles.metaItemGames}>
                    <MaterialCommunityIcons
                      name="account-group-outline"
                      size={16}
                      color={theme.colors.onSurfaceVariant}
                    />
                    <Text variant="bodySmall" style={styles.metaTextGames}>
                      {game.players}
                    </Text>
                  </View>
                </View>
                <View style={styles.tagsGames}>
                  <Text style={styles.tagGames}>{game.category}</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>
      </Card.Content>
    );
  }
  return null;
}
