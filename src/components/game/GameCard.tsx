// src/components/GameCard.tsx
import React from "react";
import { View, Image } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppTheme } from "@/src/themes/types";

type Game = {
  name: string;
  description: string;
  picture: any;
  duration: string;
  players: string;
};

export default function GameCard({ game }: { game: Game }) {
  const theme = useTheme<AppTheme>();

  return (
    <Card
      mode="outlined"
      style={{
        width: 160,
        marginRight: 12,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: theme.colors.elevation.level1,
      }}
    >
      <Image
        source={game.picture}
        resizeMode="contain"
        style={{
          width: "100%",
          height: 100,
          marginTop: 16
        }}
      />

      <View style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
        <Text
          variant="bodyMedium"
          style={{
            fontWeight: "bold",
            marginBottom: 6,
          }}
        >
          {game.name}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <MaterialCommunityIcons name="clock-outline" size={14} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodySmall" style={{ marginLeft: 6, color: theme.colors.onSurfaceVariant }}>
            {game.duration}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialCommunityIcons name="account-group-outline" size={14} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodySmall" style={{ marginLeft: 6, color: theme.colors.onSurfaceVariant }}>
            {game.players}
          </Text>
        </View>
      </View>
    </Card>
  );
}
