import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { useTheme, Text, Divider } from 'react-native-paper';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { AppTheme } from '@/themes/types';

export default function Header() {
  const theme = useTheme<AppTheme>();

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 12,
          backgroundColor: theme.colors.background,
        }}
      >
        {/* Left: Logo + Title */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="view-dashboard" size={30} color={theme.colors.primary} />
          <Text variant="titleLarge" style={{ marginLeft: 8, fontWeight: 'bold' }}>
            Game Night
          </Text>
        </View>

        {/* Right: Icons */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={{ marginRight: 16 }}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.onBackground} />
          </TouchableOpacity>

          <TouchableOpacity>
            <Image
              source={{ uri: 'https://i.pravatar.cc/40' }}
              style={{ width: 34, height: 34, borderRadius: 100 }}
            />
          </TouchableOpacity>
        </View>
      </View>
      <Divider style={{ marginBottom: 18, backgroundColor: theme.colors.divider }} />
    </>
  );
}
