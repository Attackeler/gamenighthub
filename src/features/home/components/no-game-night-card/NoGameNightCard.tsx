import React from 'react';
import { View } from 'react-native';
import { Card, Text, useTheme, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppTheme } from '@/app/theme/types';

import { noGameCardStyles } from './NoGameNightCard.styles';
import { NoGameNightCardProps } from './NoGameNightCard.types';

export default function NoGameNightCard({ onCreatePress }: NoGameNightCardProps) {
    const theme = useTheme<AppTheme>();

    return (
        <Card style={noGameCardStyles.card} mode="outlined">
            <Card.Content style={{ backgroundColor: theme.colors.surface }}>
                <View style={noGameCardStyles.container}>
                    <MaterialCommunityIcons name="calendar" size={48} color={theme.colors.divider} />
                    <Text variant="titleMedium" style={noGameCardStyles.title}>
                        No active game nights
                    </Text>
                    <Text variant="titleMedium" style={noGameCardStyles.subtitle}>
                        Create your first game night to get started!
                    </Text>
                    <TouchableRipple
                        onPress={onCreatePress}
                        rippleColor="rgba(255,255,255,0.3)"
                        style={[noGameCardStyles.button, { backgroundColor: theme.colors.primary }]}
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

