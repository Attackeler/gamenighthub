import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProviderWrapper } from '@/contexts/Theme/ThemeProviderWrapper';
import Header from '@/layout/Header/Header';
import { Divider, useTheme } from 'react-native-paper';
import { AppTheme } from '@/themes/types';
import { View } from 'react-native';

export default function RootLayoutNav() {
    const theme = useTheme<AppTheme>();

    return (
        <ThemeProviderWrapper>
            <View style={{ backgroundColor: theme.colors.background }}>
                <Header />
            </View>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: theme.colors.background, width: '100%', marginHorizontal: 'auto' },
                }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="games" />
            </Stack>
        </ThemeProviderWrapper>
    );
}
