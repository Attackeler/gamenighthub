import { AppTheme } from "@/themes/types";
import React from "react";
import { useTheme, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Modal() {
    const theme = useTheme<AppTheme>();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.outline, borderStyle: "solid", borderRadius: 8 }}>
        <Text>Test</Text>
    </SafeAreaView>
  );
}