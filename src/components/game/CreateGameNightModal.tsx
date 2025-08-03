import React from "react";
import {
  Dialog,
  Portal,
  Text,
  TextInput,
  Button,
  useTheme,
  Modal,
} from "react-native-paper";
import { View, Platform } from "react-native";
import { AdvancedCheckbox } from "react-native-advanced-checkbox";

import { games, friends } from "../game/mockData";
import { useGameNightForm } from "../game/useGameNightForm";

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
  const form = useGameNightForm();

  const handleSubmit = () => {
    const { title, date, time, location } = form;

    if (!title || !date || !time || !location) {
      form.setShowErrorDialog(true);
      return;
    }

    onCreate();
    form.resetForm?.(); 
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
        value={form.title}
        onChangeText={form.setTitle}
        mode="outlined"
        style={{ marginBottom: 12 }}
      />

      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <TextInput
          label="Date *"
          value={form.date}
          onChangeText={form.setDate}
          mode="outlined"
          style={{ flex: 1 }}
        />
        <TextInput
          label="Time *"
          value={form.time}
          onChangeText={form.setTime}
          mode="outlined"
          style={{ flex: 1 }}
        />
      </View>

      <TextInput
        label="Location *"
        value={form.location}
        onChangeText={form.setLocation}
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
            value={form.selectedGames.includes(game.id)}
            onValueChange={() => form.toggleGame(game.id)}
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
            value={form.invitedFriends.includes(friend.id)}
            onValueChange={() => form.toggleFriend(friend.id)}
            uncheckedColor={theme.colors.outline}
            checkedColor={theme.colors.primary}
          />
          <Text style={{ marginLeft: 8 }}>{`${friend.name}   (${friend.email})`}</Text>
        </View>
      ))}

      <View
        style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 20 }}
      >
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

      <Dialog
        visible={form.showErrorDialog}
        onDismiss={() => form.setShowErrorDialog(false)}
      >
        <Dialog.Title>Error</Dialog.Title>
        <Dialog.Content>
          <Text>Please fill all information required.</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => form.setShowErrorDialog(false)}>OK</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
