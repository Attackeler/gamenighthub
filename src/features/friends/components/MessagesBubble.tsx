import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import {
  Avatar,
  Badge,
  FAB,
  Portal,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";

import { AppTheme } from "@/app/theme/types";
import { useConversationSummaries } from "@/features/friends/hooks/useConversationSummaries";
import ConversationView from "@/features/friends/components/ConversationView";
import { useUserProfile } from "@/features/profile/context/UserProfileContext";
import useAuth from "@/features/auth/hooks/useAuth";

export default function MessagesBubble() {
  const theme = useTheme<AppTheme>();
  const { summaries, unreadCount } = useConversationSummaries();
  const { friends, sendMessage, markConversationRead } = useUserProfile();
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [activeFriendId, setActiveFriendId] = useState<string | null>(null);
  const { width, height } = useWindowDimensions();

  const friendMap = useMemo(
    () => new Map(friends.map((friend) => [friend.uid, friend])),
    [friends],
  );

  const items = useMemo(
    () =>
      summaries.map((summary) => ({
        summary,
        friend: friendMap.get(summary.friendUid) ?? null,
      })),
    [summaries, friendMap],
  );

  const activeFriend = activeFriendId ? friendMap.get(activeFriendId) ?? null : null;

  useEffect(() => {
    if (!visible) {
      setActiveFriendId(null);
    }
  }, [visible]);

  const panelWidth = Math.min(width - 32, 360);
  const panelMaxHeight = Math.min(height - 200, 520);
  const effectivePanelHeight = Math.max(280, panelMaxHeight);
  const conversationMaxHeight = Math.max(200, effectivePanelHeight - 32);
  const badgeValue = unreadCount > 99 ? "99+" : unreadCount.toString();

  return (
    <Portal>
      <View
        pointerEvents="box-none"
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <View
          style={{
            position: "absolute",
            right: 24,
            bottom: 96,
          }}
          pointerEvents="box-none"
        >
          <FAB
            icon={visible ? "close" : "message-text"}
            onPress={() => setVisible((prev) => !prev)}
            style={{ backgroundColor: theme.colors.primary }}
            color={theme.colors.onPrimary}
            size="medium"
            accessibilityLabel="Toggle messages"
          />
          {unreadCount > 0 && !visible ? (
            <Badge
              size={18}
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                backgroundColor: theme.colors.error,
                color: theme.colors.onError,
              }}
            >
              {badgeValue}
            </Badge>
          ) : null}
        </View>

        {visible ? (
          <View
            pointerEvents="box-none"
            style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <Pressable
              onPress={() => setVisible(false)}
              style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
            />
            <Surface
              elevation={6}
              style={{
                position: "absolute",
                right: 24,
                bottom: 160,
                width: panelWidth,
                maxHeight: effectivePanelHeight,
                borderRadius: 20,
                padding: 16,
                backgroundColor: theme.colors.surface,
                gap: 12,
              }}
            >
              {activeFriend ? (
              <ConversationView
                friend={activeFriend}
                onClose={() => setActiveFriendId(null)}
                style={{ maxHeight: conversationMaxHeight }}
                currentUserId={user?.uid ?? null}
                sendMessage={sendMessage}
                markConversationRead={markConversationRead}
              />
              ) : (
                <>
                  <View>
                    <Text
                      variant="titleMedium"
                      style={{ fontWeight: "600", color: theme.colors.onSurface, marginBottom: 4 }}
                    >
                      Messages
                    </Text>
                    <Text style={{ color: theme.colors.onSurfaceVariant }}>
                      Tap a friend to jump into the conversation.
                    </Text>
                  </View>
                  <ScrollView
                    style={{ flexGrow: 0 }}
                    contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
                  >
                    {items.length === 0 ? (
                      <View style={{ paddingVertical: 32, alignItems: "center", gap: 8 }}>
                        <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
                          You don't have any conversations yet.
                        </Text>
                        <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
                          Add a friend to start chatting.
                        </Text>
                      </View>
                    ) : (
                      items.map(({ summary, friend }) => (
                        <Pressable
                          key={summary.id}
                          onPress={() => setActiveFriendId(summary.friendUid)}
                          style={{
                            borderRadius: 16,
                            padding: 12,
                            backgroundColor: summary.unread
                              ? theme.colors.primaryContainer
                              : theme.colors.surfaceVariant,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <Avatar.Image
                            size={40}
                            source={{
                              uri:
                                friend?.photoURL ??
                                `https://i.pravatar.cc/100?u=${summary.friendUid}`,
                            }}
                          />
                          <View style={{ flex: 1, gap: 4 }}>
                            <Text
                              style={{
                                fontWeight: "600",
                                color: theme.colors.onSurface,
                              }}
                              numberOfLines={1}
                            >
                              {friend?.displayName ?? "Friend"}
                            </Text>
                            <Text
                              style={{
                                color: theme.colors.onSurfaceVariant,
                              }}
                              numberOfLines={1}
                            >
                              {summary.lastMessageText
                                ? summary.lastMessageText
                                : "Start a conversation"}
                            </Text>
                          </View>
                          {summary.unread ? (
                            <Badge
                              size={16}
                              style={{
                                backgroundColor: theme.colors.error,
                                color: theme.colors.onError,
                              }}
                            >
                              !
                            </Badge>
                          ) : null}
                        </Pressable>
                      ))
                    )}
                  </ScrollView>
                </>
              )}
            </Surface>
          </View>
        ) : null}
      </View>
    </Portal>
  );
}
