import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { SectionProps } from './Section.types';
import { sectionStyles } from './Section.styles';

export default function Section({ title, actionLabel, onActionPress }: SectionProps) {
  const theme = useTheme();

  return (
    <View style={sectionStyles.container}>
      <Text variant="titleMedium" style={sectionStyles.title}>
        {title}
      </Text>
      {actionLabel && onActionPress && (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={[sectionStyles.actionLabel, { color: theme.colors.primary }]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
