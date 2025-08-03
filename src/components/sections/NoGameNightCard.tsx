// src/components/NoGameNightCard.tsx
import React from 'react';
import { View } from 'react-native';
import { Card, Text, useTheme, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppTheme } from '@/themes/types';

type Props = {
    onCreatePress: () => void;
};

export default function NoGameNightCard({ onCreatePress }: Props) {
    const theme = useTheme<AppTheme>();

    return (
        <Card style={{ marginBottom: 12 }} mode="outlined">
            <Card.Content>
                <View style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
                    <MaterialCommunityIcons name="calendar" size={48} color={theme.colors.divider} />
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                        No active game nights
                    </Text>
                    <Text variant="titleMedium" style={{ marginBottom: 16 }}>
                        Create your first game night to get started!
                    </Text>
                    <TouchableRipple
                        onPress={onCreatePress}
                        rippleColor="rgba(255,255,255,0.3)"
                        borderless={false}
                        style={{
                            width: 200,
                            height: 40,
                            borderRadius: 16,
                            backgroundColor: theme.colors.primary,
                            paddingVertical: 5,
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                        }}
                    >
                        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
                            <MaterialCommunityIcons name="plus" size={20} color={theme.colors.onCreateButton} />
                            <Text
                                selectable={false}
                                style={{
                                    color: theme.colors.onCreateButton,
                                    fontWeight: '600',
                                    userSelect: 'none',
                                }}
                            >
                                Create Game Night
                            </Text>
                        </View>
                    </TouchableRipple>
                </View>
            </Card.Content>
        </Card>
    );
}
