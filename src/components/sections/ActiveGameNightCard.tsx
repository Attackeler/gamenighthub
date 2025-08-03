// ActiveGameNightCard.tsx
import React from 'react';
import { View, Image } from 'react-native';
import { Card, Text, useTheme, IconButton, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { activeCardStyles as styles } from './ActiveGameNightCard.styles';
import { ActiveGameNightCardProps } from './ActiveGameNightCard.types';

export default function ActiveGameNightCard({
  title,
  date,
  location,
  members,
  onMessagePress,
  onViewPress,
  onDeletePress,
}: ActiveGameNightCardProps) {
  const theme = useTheme();

  return (
    <Card style={styles.card} mode="outlined">
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title}>
            {title}
          </Text>
          <IconButton icon="trash-can-outline" size={20} onPress={onDeletePress} />
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons name="calendar" size={16} color={theme.colors.outline} />
          <Text style={{ marginLeft: 4, color: theme.colors.onSurface }}>{date}</Text>
        </View>

        <View style={[styles.row, styles.locationRow]}>
          <MaterialCommunityIcons name="map-marker" size={16} color={theme.colors.outline} />
          <Text style={{ marginLeft: 4, color: theme.colors.onSurface }}>{location}</Text>
        </View>

        <View style={styles.actionButtons}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {members.map((avatar, idx) => (
              <Image
                key={idx}
                source={{ uri: avatar }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  marginRight: -8,
                  borderWidth: 1,
                  borderColor: '#fff',
                }}
              />
            ))}
            <Text style={{ marginLeft: 12 }}>{members.length} players</Text>
          </View>

          <View style={{ flexDirection: 'row' }}>
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
