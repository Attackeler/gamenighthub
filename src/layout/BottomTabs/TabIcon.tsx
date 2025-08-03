import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  routeName: string;
  color: string;
  size: number;
}

export function TabIcon({ routeName, color, size }: Props) {
  let iconName: keyof typeof MaterialCommunityIcons.glyphMap;

  switch (routeName) {
    case 'Home':
      iconName = 'home';
      break;
    case 'Games':
      iconName = 'gamepad-variant';
      break;
    case 'Friends':
      iconName = 'account-group';
      break;
    case 'Stats':
      iconName = 'chart-bar';
      break;
    case 'Profile':
      iconName = 'account';
      break;
    default:
      iconName = 'help-circle';
  }

  return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
}
