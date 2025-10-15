import React, { useMemo, useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { Button, Card, Chip, Dialog, IconButton, Portal, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@/shared/icons';

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
  const [selectedGamesDialogVisible, setSelectedGamesDialogVisible] = useState(false);

  const inlineSelectedGames = useMemo(
    () => selectedGames.slice(0, 2),
    [selectedGames],
  );
  const extraSelectedGamesCount = Math.max(selectedGames.length - inlineSelectedGames.length, 0);

  return (
    <>
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
          <MaterialCommunityIcons name="gamepad-variant-outline" size={16} color={theme.colors.outline} style={styles.gamesRowIcon} />
          {selectedGames.length === 0 ? (
            <Text style={{ color: theme.colors.onSurface }} numberOfLines={1}>
              No games selected
            </Text>
          ) : (
            <View style={styles.selectedGamesChipContainer}>
              {inlineSelectedGames.map((game) => (
                <Chip
                  key={`active-chip-${game.id}`}
                  mode="outlined"
                  style={styles.selectedGameChip}
                  textStyle={styles.selectedGameChipText}
                >
                  {game.name}
                </Chip>
              ))}
              {extraSelectedGamesCount > 0 && (
                <Chip
                  mode="outlined"
                  icon="format-list-bulleted"
                  onPress={() => setSelectedGamesDialogVisible(true)}
                  style={styles.selectedGameChip}
                  textStyle={styles.selectedGameChipText}
                >
                  +{extraSelectedGamesCount} more
                </Chip>
              )}
            </View>
          )}
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

      <Portal>
        <Dialog
          visible={selectedGamesDialogVisible}
          onDismiss={() => setSelectedGamesDialogVisible(false)}
          style={{
            maxWidth: 420,
            alignSelf: 'center',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.background,
          }}
        >
          <Dialog.Title>Selected Games</Dialog.Title>
          <Dialog.Content style={{ maxHeight: 320 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedGames.map((game) => (
                <View key={`dialog-game-${game.id}`} style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: '600', color: theme.colors.onSurface }}>
                    {game.name}
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      marginTop: 2,
                      fontSize: 12,
                    }}
                  >
                    {`${game.duration} • ${game.players}`}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSelectedGamesDialogVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}




