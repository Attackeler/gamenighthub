import React from 'react';
import { Image, View } from 'react-native';
import { Button, Card, IconButton, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppTheme } from '@/app/theme/types';

import { activeCardStyles as styles } from './ActiveGameNightCard.styles';
import { ActiveGameNightCardProps } from './ActiveGameNightCard.types';

export default function ActiveGameNightCard({
  title,
  date,
  time,
  location,
  members,
  invitedFriends,
  selectedGames,
  onMessagePress,
  onViewPress,
  onDeletePress,
}: ActiveGameNightCardProps) {
  const theme = useTheme<AppTheme>();

  return (
    <Card style={styles.card} mode="outlined">
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title}>
            {title}
          </Text>
          <IconButton icon="trash-can-outline" size={20} onPress={onDeletePress} />
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons name="calendar" size={16} color={theme.colors.outline} />
          <Text style={{ color: theme.colors.onSurface }}>
            {time ? `${date} @ ${time}` : date}
          </Text>
        </View>

        <View style={[styles.row, styles.locationRow]}>
          <MaterialCommunityIcons name="map-marker" size={16} color={theme.colors.outline} />
          <Text style={{ color: theme.colors.onSurface }} numberOfLines={1}>
            {location}
          </Text>
        </View>

        <View style={[styles.row, styles.gamesRow]}>
          <MaterialCommunityIcons name="gamepad-variant-outline" size={16} color={theme.colors.outline} />
          <Text style={{ color: theme.colors.onSurface }} numberOfLines={1}>
            {selectedGames.length
              ? selectedGames.map((game) => game.name).join(', ')
              : 'No games selected'}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.invitedRow}>
            <View style={styles.avatarStack}>
              {members.map((avatar, idx) => (
                <Image
                  key={idx}
                  source={{ uri: avatar }}
                  style={styles.avatar}
                />
              ))}
            </View>
            <Text
              style={[
                styles.invitedLabel,
                members.length === 0 && { marginLeft: 0 },
              ]}
            >
              {invitedFriends.length ? `${invitedFriends.length} invited` : 'No invitations yet'}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <Button
              mode="text"
              onPress={onMessagePress}
              icon={({ color, size }) => (
                <MaterialCommunityIcons name="message-outline" size={size} color={color} />
              )}
              compact
            >
              Message
            </Button>
            <Button mode="text" onPress={onViewPress} compact>
              View
            </Button>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}
