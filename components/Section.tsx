import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type SectionProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export default function Section({ title, actionLabel, onActionPress }: SectionProps) {
  const theme = useTheme();

  return (
    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16}}>
      <Text variant="titleMedium" style={{ marginBottom: 8, fontWeight: 'bold' }}>
        {title}
      </Text>
      {actionLabel && onActionPress && (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
   </View>
  );
}
