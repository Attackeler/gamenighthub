import React, { useContext } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { useTheme, Text, Divider, Appbar } from 'react-native-paper';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { AppTheme } from '@/themes/types';
import { ThemeContext } from '@/contexts/Theme/ThemeContext';

export default function Header() {
  const theme = useTheme<AppTheme>();
  const { isDark, toggleTheme } = useContext(ThemeContext);

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      {/* Full-width background */}
      <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
        {/* CENTERED CONTENT inside maxWidth container */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: 1000,
            width: '100%',
            paddingHorizontal: 16,
            marginHorizontal: 'auto',
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
            <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 16 }}>
              <Ionicons
                name={isDark ? 'sunny-outline' : 'moon-outline'}
                size={24}
                color={theme.colors.onBackground}
              />
            </TouchableOpacity>

            <TouchableOpacity style={{ marginRight: 16 }}>
              <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <TouchableOpacity>
              <Image
                source={{ uri: 'https://i.pravatar.cc/40' }}
                style={{ width: 34, height: 34, borderRadius: 100 }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Appbar.Header>
      <Divider style={{
        backgroundColor: theme.colors.divider, justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 960,
        width: '90%',
        height: 1,

        marginHorizontal: 'auto',
        marginBottom: 8
      }} />

    </View>
  );
}
