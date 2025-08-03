import React from 'react';

import ButtonTabs from '@/layout/BottomTabs/BottomTabs';
import { NavigationIndependentTree } from '@react-navigation/native';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
export default function TabLayout() {

  return (
    <NavigationIndependentTree>
      <ButtonTabs />
    </NavigationIndependentTree>
  );
}
