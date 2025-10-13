import React, { useContext } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { Appbar, Divider, Text, useTheme } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { AppTheme } from '@/app/theme/types';
import { ThemeContext } from '@/app/providers/theme/ThemeContext';

export default function Header() {
  const theme = useTheme<AppTheme>();
  const { isDark, toggleTheme } = useContext(ThemeContext);

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="view-dashboard" size={30} color={theme.colors.primary} />
            <Text variant="titleLarge" style={{ marginLeft: 8, fontWeight: 'bold' }}>
              Game Night
            </Text>
          </View>

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
      <Divider
        style={{
          backgroundColor: theme.colors.divider,
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: 960,
          width: '90%',
          height: 1,
          marginHorizontal: 'auto',
          marginBottom: 8,
        }}
      />
    </View>
  );
}
