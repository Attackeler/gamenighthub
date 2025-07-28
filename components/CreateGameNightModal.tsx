import React, { useState } from "react";
import {
  Dialog,
  Portal,
  Text,
  TextInput,
  Button,
  Checkbox,
  useTheme,
} from "react-native-paper";
import { ScrollView, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const games = [
  { id: 1, name: "Activity", duration: "45-75 min", players: "3-16 players" },
  { id: 2, name: "Catan", duration: "60-90 min", players: "3-4 players" },
  { id: 3, name: "Monopoly", duration: "120-240 min", players: "2-8 players" },
];

const friends = [
  { id: 1, name: "teo", email: "teo@teo.com" },
  { id: 2, name: "test", email: "test@test.com" },
];

export default function CreateGameNightModal({ visible, onDismiss , onCreate}: { visible: boolean; onDismiss: () => void; onCreate: () => void; }) {
  const theme = useTheme();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("");
  const [selectedGames, setSelectedGames] = useState<number[]>([]);
  const [invitedFriends, setInvitedFriends] = useState<number[]>([]);

  const toggleGame = (id: number) => {
    setSelectedGames((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const toggleFriend = (id: number) => {
    setInvitedFriends((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={{ maxHeight: "90%" }}>
        <Dialog.ScrollArea>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}>
            <Text variant="titleMedium" style={{ fontWeight: "bold", marginBottom: 16 }}>Create Game Night</Text>

            <TextInput label="Game Night Title *" value={title} onChangeText={setTitle} mode="outlined" style={{ marginBottom: 12 }} />
            <TextInput label="Description" value={desc} onChangeText={setDesc} mode="outlined" multiline style={{ marginBottom: 12 }} />

            <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
              <TextInput label="Date *" value={date} onChangeText={setDate} mode="outlined" style={{ flex: 1 }} />
              <TextInput label="Time *" value={time} onChangeText={setTime} mode="outlined" style={{ flex: 1 }} />
            </View>

            <TextInput label="Location *" value={location} onChangeText={setLocation} mode="outlined" style={{ marginBottom: 12 }} />
            <TextInput label="Address (Optional)" value={address} onChangeText={setAddress} mode="outlined" style={{ marginBottom: 12 }} />
            <TextInput label="Maximum Players" value={maxPlayers} onChangeText={setMaxPlayers} mode="outlined" style={{ marginBottom: 20 }} />

            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Select Games</Text>
            {games.map((game) => (
              <View
                key={game.id}
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
              >
                <Checkbox
                  status={selectedGames.includes(game.id) ? "checked" : "unchecked"}
                  onPress={() => toggleGame(game.id)}
                />
                <Text>{`${game.name}   🕒 ${game.duration}   👥 ${game.players}`}</Text>
              </View>
            ))}

            <Text style={{ fontWeight: "bold", marginTop: 20, marginBottom: 10 }}>Invite Friends</Text>
            {friends.map((friend) => (
              <View
                key={friend.id}
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
              >
                <Checkbox
                  status={invitedFriends.includes(friend.id) ? "checked" : "unchecked"}
                  onPress={() => toggleFriend(friend.id)}
                />
                <Text>{`${friend.name}   (${friend.email})`}</Text>
              </View>
            ))}

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 20 }}>
              <Button onPress={onDismiss}>Cancel</Button>
              <Button mode="contained" style={{ marginLeft: 12 }}>
                Create Game Night
              </Button>
            </View>
          </ScrollView>
        </Dialog.ScrollArea>
      </Dialog>
    </Portal>
  );
}
