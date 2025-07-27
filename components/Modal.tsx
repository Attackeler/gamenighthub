import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type SectionProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  children: React.ReactNode;
};

export default function Modal({ title, actionLabel, onActionPress, children }: SectionProps) {
  const theme = useTheme();

  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
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
      <View style={{ padding: 14, flex: 1, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.outline, borderStyle: "solid", borderRadius: 8 }}>{children}</View>
    </View>
  );
}
