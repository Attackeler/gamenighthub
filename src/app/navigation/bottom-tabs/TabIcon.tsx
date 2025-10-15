import React from 'react';

import { MaterialCommunityIcons, MaterialCommunityIconName } from '@/shared/icons';

interface Props {
  routeName: string;
  color: string;
  size: number;
}

export function TabIcon({ routeName, color, size }: Props) {
  let iconName: MaterialCommunityIconName;

  switch (routeName) {
    case 'home':
      iconName = 'home';
      break;
    case 'games':
      iconName = 'gamepad-variant';
      break;
    case 'friends':
      iconName = 'account-group';
      break;
    case 'stats':
      iconName = 'chart-bar';
      break;
    case 'profile':
      iconName = 'account';
      break;
    default:
      iconName = 'help-circle';
  }

  return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
}
