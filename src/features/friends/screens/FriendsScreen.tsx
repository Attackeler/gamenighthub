import React, { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  HelperText,
  IconButton,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

import { AppTheme } from "@/app/theme/types";
import { useUserProfile } from "@/features/profile/context/UserProfileContext";
import ConversationView from "@/features/friends/components/ConversationView";
import useAuth from "@/features/auth/hooks/useAuth";

type FeedbackMessage = {
  tone: "success" | "error";
  text: string;
};

export default function FriendsScreen() {
  const theme = useTheme<AppTheme>();
  const { user } = useAuth();
  const {
    profile,
    friends,
    loadingFriends,
    incomingFriendRequests,
    addFriendByCode,
    removeFriend,
    sendMessage,
    markConversationRead,
  } =
    useUserProfile();
  const [friendCodeInput, setFriendCodeInput] = useState("");
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [adding, setAdding] = useState(false);
  const [activeFriendId, setActiveFriendId] = useState<string | null>(null);

  const activeFriend = useMemo(
    () => friends.find((friend) => friend.uid === activeFriendId) ?? null,
    [friends, activeFriendId],
  );

  const handleAddFriend = async () => {
    if (!friendCodeInput.trim()) return;
    setAdding(true);
    setFeedback(null);
    try {
      await addFriendByCode(friendCodeInput);
      setFeedback({
        tone: "success",
        text: "Friend request sent! They'll need to accept before you're connected.",
      });
      setFriendCodeInput("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add friend.";
      setFeedback({ tone: "error", text: message });
    } finally {
      setAdding(false);
    }
  };

  const renderFriendItem = ({ item }: { item: typeof friends[number] }) => (
    <Card
      style={{
        borderRadius: 16,
        marginBottom: 12,
        padding: 16,
        backgroundColor: theme.colors.surface,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <Avatar.Image
          size={48}
          source={{ uri: item.photoURL ?? `https://i.pravatar.cc/100?u=${item.uid}` }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "600", color: theme.colors.onSurface }}>
            {item.displayName}
          </Text>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>{item.email}</Text>
          <Text
            style={{
              color: theme.colors.primary,
              fontWeight: "600",
              marginTop: 4,
              letterSpacing: 1.5,
            }}
          >
            ID: {item.friendCode}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <IconButton
            icon="message-text"
            mode="contained"
            onPress={() => setActiveFriendId(item.uid)}
            accessibilityLabel={`Message ${item.displayName}`}
          />
          <IconButton
            icon="account-remove"
            mode="contained-tonal"
            onPress={async () => {
              try {
                await removeFriend(item.uid);
                setFeedback({
                  tone: "success",
                  text: `${item.displayName} has been removed from your friends.`,
                });
              } catch (error) {
                const message =
                  error instanceof Error ? error.message : "Failed to remove friend.";
                setFeedback({ tone: "error", text: message });
              }
            }}
            accessibilityLabel={`Remove ${item.displayName}`}
          />
        </View>
      </View>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 24, gap: 24 }}>
      <View
        style={{
          alignSelf: "center",
          width: "100%",
          maxWidth: 560,
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          padding: 20,
          gap: 12,
        }}
      >
        <Text variant="titleMedium" style={{ fontWeight: "600", color: theme.colors.onSurface }}>
          Add a Friend
        </Text>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>
          Ask your friend for their ID and add it here. IDs are case-insensitive.
        </Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TextInput
            mode="outlined"
            style={{ flex: 1 }}
            label="Friend ID"
            value={friendCodeInput}
            autoCapitalize="characters"
            onChangeText={setFriendCodeInput}
            spellCheck={false}
            autoCorrect={false}
          />
          <Button
            mode="contained"
            onPress={handleAddFriend}
            loading={adding}
            disabled={!friendCodeInput.trim()}
            style={{ alignSelf: "center" }}
          >
            Add
          </Button>
        </View>
        {feedback && (
          <HelperText type={feedback.tone === "success" ? "info" : "error"} visible>
            {feedback.text}
          </HelperText>
        )}
      </View>

      <View
        style={{
          flex: 1,
          alignSelf: "center",
          width: "100%",
          maxWidth: 960,
        }}
      >
        <Text variant="titleMedium" style={{ fontWeight: "600", color: theme.colors.onSurface }}>
          Friends
        </Text>
        {loadingFriends ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator />
          </View>
        ) : friends.length === 0 ? (
          <View style={{ marginTop: 32, alignItems: "center", gap: 8 }}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              {incomingFriendRequests.length > 0
                ? "Respond to pending friend requests from the notifications icon to connect."
                : "You haven't added any friends yet."}
            </Text>
            {incomingFriendRequests.length === 0 ? (
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                Share your ID ({profile?.friendCode ?? "••••••••"}) so others can add you!
              </Text>
            ) : null}
          </View>
        ) : (
          <FlatList
            data={friends}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.uid}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <Portal>
        <Modal
          visible={Boolean(activeFriend)}
          onDismiss={() => {
            setActiveFriendId(null);
          }}
          contentContainerStyle={{
            margin: 24,
            borderRadius: 20,
            backgroundColor: theme.colors.surface,
            padding: 16,
            maxHeight: "80%",
          }}
        >
          {activeFriend ? (
            <ConversationView
              friend={activeFriend}
              onClose={() => setActiveFriendId(null)}
              style={{ flex: 1 }}
              currentUserId={user?.uid ?? null}
              sendMessage={sendMessage}
              markConversationRead={markConversationRead}
            />
          ) : null}
        </Modal>
      </Portal>
    </View>
  );
}
