import React, { useState } from "react";
import {
  Dialog,
  Portal,
  Text,
  TextInput,
  Button,
  useTheme,
  Modal,
} from "react-native-paper";
import { ScrollView, View, Platform } from "react-native";
import { AdvancedCheckbox } from "react-native-advanced-checkbox";

// Import mock data
import { games, friends } from "../game/mockData";

export default function CreateGameNightModal({
  visible,
  onDismiss,
  onCreate,
}: {
  visible: boolean;
  onDismiss: () => void;
  onCreate: () => void;
}) {
  const theme = useTheme();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [selectedGames, setSelectedGames] = useState<number[]>([]);
  const [invitedFriends, setInvitedFriends] = useState<number[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

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

  const handleSubmit = () => {
    if (!title || !date || !time || !location) {
      setShowErrorDialog(true);
      return;
    }

    onCreate();
    onDismiss();
  };

  const renderContent = () => (
    <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
      <Text
        variant="titleMedium"
        style={{ fontWeight: "bold", marginBottom: 16 }}
      >
        Create Game Night
      </Text>

      <TextInput
        label="Game Night Title *"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        style={{ marginBottom: 12 }}
      />

      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <TextInput
          label="Date *"
          value={date}
          onChangeText={setDate}
          mode="outlined"
          style={{ flex: 1 }}
        />
        <TextInput
          label="Time *"
          value={time}
          onChangeText={setTime}
          mode="outlined"
          style={{ flex: 1 }}
        />
      </View>

      <TextInput
        label="Location *"
        value={location}
        onChangeText={setLocation}
        mode="outlined"
        style={{ marginBottom: 12 }}
      />

      <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Select Games</Text>
      {games.map((game) => (
        <View
          key={game.id}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
            userSelect: "none",
          }}
        >
          <AdvancedCheckbox
            value={selectedGames.includes(game.id)}
            onValueChange={() => toggleGame(game.id)}
            uncheckedColor={theme.colors.outline}
            checkedColor={theme.colors.primary}
          />
          <Text style={{ marginLeft: 8 }}>
            {`${game.name}   🕒 ${game.duration}   👥 ${game.players}`}
          </Text>
        </View>
      ))}

      <Text style={{ fontWeight: "bold", marginTop: 20, marginBottom: 10 }}>
        Invite Friends
      </Text>
      {friends.map((friend) => (
        <View
          key={friend.id}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
            userSelect: "none",
          }}
        >
          <AdvancedCheckbox
            value={invitedFriends.includes(friend.id)}
            onValueChange={() => toggleFriend(friend.id)}
            uncheckedColor={theme.colors.outline}
            checkedColor={theme.colors.primary}
          />
          <Text style={{ marginLeft: 8 }}>{`${friend.name}   (${friend.email})`}</Text>
        </View>
      ))}

      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 20 }}>
        <Button onPress={onDismiss}>Cancel</Button>
        <Button mode="contained" style={{ marginLeft: 12 }} onPress={handleSubmit}>
          Create Game Night
        </Button>
      </View>
    </View>
  );

  return (
    <Portal>
      {Platform.OS === "web" ? (
        <Dialog
          visible={visible}
          onDismiss={onDismiss}
          style={{ maxWidth: 700, alignSelf: "center" }}
        >
          <Dialog.Content>{renderContent()}</Dialog.Content>
        </Dialog>
      ) : (
        <Modal
          visible={visible}
          onDismiss={onDismiss}
          contentContainerStyle={{
            marginHorizontal: 16,
            borderRadius: 20,
            backgroundColor: theme.colors.elevation.level3,
            paddingVertical: 16,
          }}
        >
          {renderContent()}
        </Modal>
      )}

      <Dialog visible={showErrorDialog} onDismiss={() => setShowErrorDialog(false)}>
        <Dialog.Title>Error</Dialog.Title>
        <Dialog.Content>
          <Text>Please fill all information required.</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowErrorDialog(false)}>OK</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
