import React, { useEffect, useMemo, useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const description = game?.description ?? '';
  const shouldShowToggle = description.length > 220;
  const [hasImageError, setHasImageError] = useState(false);

  const resolvedImageUri = useMemo(() => {
    if (typeof game.picture !== 'string') {
      return null;
    }

    if (game.picture.startsWith('http://') || game.picture.startsWith('https://')) {
      return game.picture;
    }

    if (game.picture.startsWith('//')) {
      return `https:${game.picture}`;
    }

    if (game.picture.startsWith('/')) {
      return `https://boardgamegeek.com${game.picture}`;
    }

    return null;
  }, [game.picture]);

  useEffect(() => {
    setIsDescriptionExpanded(false);
    setHasImageError(false);
  }, [game?.id]);

  useEffect(() => {
    if (resolvedImageUri) {
      Image.prefetch?.(resolvedImageUri).catch(() => {});
    }
  }, [resolvedImageUri]);

  const pictureSource = hasImageError || !resolvedImageUri
    ? require('assets/images/adaptive-icon.png')
    : { uri: resolvedImageUri };

  if (page === 'Home' && game) {
    return (
      <Card.Content style={styles.content}>
        <Card
          mode="outlined"
          style={[styles.cardHome, { backgroundColor: theme.colors.surface }]}
        >
          <Image
            source={pictureSource}
            style={styles.image}
            resizeMode="cover"
            onError={() => setHasImageError(true)}
          />
          <View style={styles.content}>
            <Text
              variant="bodyMedium"
              style={styles.name}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
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
                source={pictureSource}
                style={styles.imageGames}
                resizeMode="cover"
                onError={() => setHasImageError(true)}
              />
              <View style={styles.infoGames}>
                <View style={styles.headerGames}>
                  <Text
                    variant="bodyMedium"
                    style={styles.nameGames}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {game.name}
                  </Text>
                </View>
                <Text
                  variant="bodySmall"
                  style={styles.descriptionGames}
                  numberOfLines={isDescriptionExpanded ? undefined : 4}
                >
                  {description}
                </Text>
                {shouldShowToggle && (
                  <TouchableOpacity
                    onPress={() =>
                      setIsDescriptionExpanded((prevExpanded) => !prevExpanded)
                    }
                    activeOpacity={0.7}
                    style={styles.descriptionToggleWrapper}
                  >
                    <Text
                      style={[
                        styles.descriptionToggleText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      {isDescriptionExpanded ? 'Read less' : 'Read more'}
                    </Text>
                  </TouchableOpacity>
                )}
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
