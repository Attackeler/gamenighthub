import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Button,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

import { AppTheme } from "@/app/theme/types";
import { useConversation } from "@/features/friends/hooks/useConversation";
import { UserProfile } from "@/features/profile/services/userProfileService";

type ConversationViewProps = {
  friend: UserProfile;
  onClose: () => void;
  style?: StyleProp<ViewStyle>;
  currentUserId: string | null;
  sendMessage: (friendUid: string, text: string) => Promise<void>;
  markConversationRead: (friendUid: string) => Promise<void>;
};

export default function ConversationView({
  friend,
  onClose,
  style,
  currentUserId,
  sendMessage,
  markConversationRead,
}: ConversationViewProps) {
  const theme = useTheme<AppTheme>();
  const { messages, loading } = useConversation(friend.uid, currentUserId);
  const [messageDraft, setMessageDraft] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    void markConversationRead(friend.uid);
  }, [friend.uid, markConversationRead]);

  useEffect(() => {
    if (messages.length > 0) {
      void markConversationRead(friend.uid);
    }
  }, [friend.uid, markConversationRead, messages]);

  const handleSend = async () => {
    const trimmed = messageDraft.trim();
    if (!trimmed || !currentUserId) return;
    setSendError(null);
    try {
      await sendMessage(friend.uid, trimmed);
      setMessageDraft("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "We couldn't send that message right now.";
      setSendError(message);
    }
  };

  return (
    <View style={[{ flex: 1 }, style]}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
          <Avatar.Image
            size={40}
            source={{
              uri: friend.photoURL ?? `https://i.pravatar.cc/100?u=${friend.uid}`,
            }}
          />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="titleMedium" style={{ fontWeight: "600", color: theme.colors.onSurface }}>
              {friend.displayName}
            </Text>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }} numberOfLines={1}>
              ID: {friend.friendCode}
            </Text>
          </View>
        </View>
        <IconButton icon="close" onPress={onClose} accessibilityLabel="Close conversation" />
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
          {loading && messages.length === 0 ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <ActivityIndicator />
            </View>
          ) : messages.length === 0 ? (
            <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
              Start the conversation with a quick hello!
            </Text>
          ) : (
            messages.map((message) => {
              const isMine = message.senderId === currentUserId;
              return (
                <View
                  key={message.id}
                  style={{
                    alignSelf: isMine ? "flex-end" : "flex-start",
                    backgroundColor: isMine ? theme.colors.primary : theme.colors.surfaceVariant,
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
            onPress={handleSend}
            disabled={!messageDraft.trim()}
          >
            Send
          </Button>
        </View>

        {sendError ? (
          <Text style={{ color: theme.colors.error, marginTop: 8 }}>{sendError}</Text>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}
