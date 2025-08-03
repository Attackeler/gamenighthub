import GameCard from "@/components/game/GameCard/GameCard";
import { AppTheme } from "@/themes/types";
import { ScrollView, View } from "react-native";
import { useTheme } from "react-native-paper";

export default function GamesScreen() {
  const theme = useTheme<AppTheme>();

  return (
    <ScrollView />
  );
}