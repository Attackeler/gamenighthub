import GameCard from "@/components/game/GameCard/GameCard";
import { useGames } from "@/hooks/useGames";
import { AppTheme } from "@/themes/types";
import { ScrollView, View } from "react-native";
import { Card, useTheme, Text, Divider } from "react-native-paper";
import { gamesScreenStyles } from "./GamesScreen.styles";

export default function GamesScreen() {
  const theme = useTheme<AppTheme>();
  const games = useGames();
  return (
    <View style={[gamesScreenStyles.root, { backgroundColor: theme.colors.background }]}>
      <View style={gamesScreenStyles.centeredContainer}>
        <ScrollView contentContainerStyle={{}}>
          <View style={gamesScreenStyles.contentWrapper}>
            <Text
              variant="titleLarge"
              style={[gamesScreenStyles.text]}
            >
              Games
            </Text> 
            {games.map((game) => (
              <GameCard key={game.id} game={game} page='Games' />
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}