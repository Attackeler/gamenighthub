import GameCard from "@/components/game/GameCard/GameCard";
import { useGames } from "@/hooks/useGames";
import { AppTheme } from "@/themes/types";
import { ScrollView, View } from "react-native";
import { Card, useTheme, Text } from "react-native-paper";

export default function GamesScreen() {
  const theme = useTheme<AppTheme>();
  const games = useGames();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
        {games.map((game) => (
          <GameCard key={game.id} game={game} page='Games' />
        ))}
      </ScrollView>
    </View>
  );
}