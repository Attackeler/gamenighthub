import React, { useMemo, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
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
import { useConversation } from "@/features/friends/hooks/useConversation";
import useAuth from "@/features/auth/hooks/useAuth";

type FeedbackMessage = {
  tone: "success" | "error";
  text: string;
};

export default function FriendsScreen() {
  const theme = useTheme<AppTheme>();
  const { profile, friends, loadingFriends, addFriendByCode, removeFriend, sendMessage } =
    useUserProfile();
  const [friendCodeInput, setFriendCodeInput] = useState("");
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [adding, setAdding] = useState(false);
  const [activeFriendId, setActiveFriendId] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState("");

  const activeFriend = useMemo(
    () => friends.find((friend) => friend.uid === activeFriendId) ?? null,
    [friends, activeFriendId],
  );

  const { messages, loading: loadingMessages } = useConversation(activeFriendId);
  const { user } = useAuth();

  const handleAddFriend = async () => {
    if (!friendCodeInput.trim()) return;
    setAdding(true);
    setFeedback(null);
    try {
      await addFriendByCode(friendCodeInput);
      setFeedback({
        tone: "success",
        text: "Friend added! They can now see you in their list too.",
      });
      setFriendCodeInput("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add friend.";
      setFeedback({ tone: "error", text: message });
    } finally {
      setAdding(false);
    }
  };

  const handleSendMessage = async () => {
    if (!activeFriend) return;
    const text = messageDraft.trim();
    if (!text) return;
    try {
      await sendMessage(activeFriend.uid, text);
      setMessageDraft("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "We couldn't send that message right now.";
      setFeedback({ tone: "error", text: message });
    }
  };

  const scrollViewRef = useRef<ScrollView | null>(null);

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

      <View style={{ flex: 1 }}>
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
              You haven't added any friends yet.
            </Text>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              Share your ID ({profile?.friendCode ?? "••••••••"}) so others can add you!
            </Text>
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
            setMessageDraft("");
          }}
          contentContainerStyle={{
            margin: 24,
            borderRadius: 20,
            backgroundColor: theme.colors.surface,
            padding: 16,
            maxHeight: "80%",
          }}
        >
          {!activeFriend ? null : (
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Avatar.Image
                    size={40}
                    source={{
                      uri: activeFriend.photoURL ?? `https://i.pravatar.cc/100?u=${activeFriend.uid}`,
                    }}
                  />
                  <View>
                    <Text
                      variant="titleMedium"
                      style={{ fontWeight: "600", color: theme.colors.onSurface }}
                    >
                      {activeFriend.displayName}
                    </Text>
                    <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                      ID: {activeFriend.friendCode}
                    </Text>
                  </View>
                </View>
                <IconButton icon="close" onPress={() => setActiveFriendId(null)} />
              </View>

              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
              >
                <ScrollView
                  ref={scrollViewRef}
                  contentContainerStyle={{ paddingVertical: 8, gap: 8 }}
                  onContentSizeChange={() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }}
                >
                  {loadingMessages && messages.length === 0 ? (
                    <View style={{ paddingVertical: 24, alignItems: "center" }}>
                      <ActivityIndicator />
                    </View>
                  ) : messages.length === 0 ? (
                    <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
                      Start the conversation with a quick hello!
                    </Text>
                  ) : (
                    messages.map((message) => {
                      const isMine = message.senderId === user?.uid;
                      return (
                        <View
                          key={message.id}
                          style={{
                            alignSelf: isMine ? "flex-end" : "flex-start",
                            backgroundColor: isMine
                              ? theme.colors.primary
                              : theme.colors.surfaceVariant,
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 12,
                            maxWidth: "80%",
                            gap: 4,
                          }}
                        >
                          <Text
                            style={{
                              color: isMine ? theme.colors.onPrimary : theme.colors.onSurface,
                            }}
                          >
                            {message.text}
                          </Text>
                          <Text
                            style={{
                              fontSize: 10,
                              textAlign: "right",
                              color: isMine ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                            }}
                          >
                            {message.createdAt.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        </View>
                      );
                    })
                  )}
                </ScrollView>

                <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                  <TextInput
                    mode="outlined"
                    style={{ flex: 1 }}
                    placeholder="Message"
                    value={messageDraft}
                    onChangeText={setMessageDraft}
                    multiline
                    maxLength={500}
                  />
                  <Button
                    mode="contained"
                    style={{ alignSelf: "center" }}
                    onPress={handleSendMessage}
                    disabled={!messageDraft.trim()}
                  >
                    Send
                  </Button>
                </View>
              </KeyboardAvoidingView>
            </View>
          )}
        </Modal>
      </Portal>
    </View>
  );
}
