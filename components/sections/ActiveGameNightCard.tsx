import React from 'react';
import { View, Image } from 'react-native';
import { Card, Text, useTheme, IconButton, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  title: string;
  date: string;
  location: string;
  members: string[]; // avatar URLs
  onMessagePress?: () => void;
  onViewPress?: () => void;
  onDeletePress: () => void;
};

export default function ActiveGameNightCard({
  title,
  date,
  location,
  members,
  onMessagePress,
  onViewPress,
  onDeletePress
}: Props) {
  const theme = useTheme();

  return (
    <Card style={{ marginBottom: 12 }} mode="outlined">
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>

          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>
            {title}
          </Text>
          <IconButton icon="trash-can-outline" size={20} onPress={onDeletePress} />

        </View>

        {/* Date & Location */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <MaterialCommunityIcons name="calendar" size={16} color={theme.colors.outline} />
          <Text style={{ marginLeft: 4, color: theme.colors.onSurface }}>{date}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <MaterialCommunityIcons name="map-marker" size={16} color={theme.colors.outline} />
          <Text style={{ marginLeft: 4, color: theme.colors.onSurface }}>{location}</Text>
        </View>

        {/* Avatars + actions */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
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
            <Button mode="text" onPress={onMessagePress} icon={({ color, size }) => (
              <MaterialCommunityIcons name="message-outline" size={size} color={color} />
            )} compact>
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
