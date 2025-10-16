import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import {
  Avatar,
  Badge,
  FAB,
  IconButton,
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
  const isCompact = width < 720;

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

  const badgeValue = unreadCount > 99 ? "99+" : unreadCount.toString();
  const panelWidth = Math.min(width - 32, 360);
  const panelMaxHeight = Math.min(height - 200, 520);
  const effectivePanelHeight = Math.max(280, panelMaxHeight);
  const conversationMaxHeight = Math.max(200, effectivePanelHeight - 32);
  const sheetTopInset = Math.max(80, height * 0.18);

  const handleToggle = () => {
    setVisible((prev) => !prev);
  };

  const handleCloseSheet = () => {
    setActiveFriendId(null);
    setVisible(false);
  };

  const handleSelectConversation = (friendUid: string) => {
    setActiveFriendId(friendUid);
  };

  const renderConversationList = (variant: "compact" | "overlay") => {
    const compact = variant === "compact";
    const emptyState = (
      <View style={{ paddingVertical: 32, alignItems: "center", gap: 8 }}>
        <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
          You don't have any conversations yet.
        </Text>
        <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
          Add a friend to start chatting.
        </Text>
      </View>
    );

    return (
      <ScrollView
        style={compact ? { flex: 1 } : { flexGrow: 0 }}
        contentContainerStyle={{
          gap: compact ? 16 : 12,
          paddingBottom: compact ? 32 : 4,
          paddingTop: compact ? 4 : 0,
        }}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0
          ? emptyState
          : items.map(({ summary, friend }) => {
              const selected = summary.friendUid === activeFriendId;
              return (
                <Pressable
                  key={summary.id}
                  onPress={() => handleSelectConversation(summary.friendUid)}
                  style={{
                    borderRadius: compact ? 18 : 16,
                    paddingVertical: compact ? 14 : 12,
                    paddingHorizontal: compact ? 16 : 12,
                    backgroundColor: summary.unread
                      ? theme.colors.primaryContainer
                      : compact
                        ? theme.colors.surfaceVariant
                        : theme.colors.surfaceVariant,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    borderWidth: selected ? 1 : 0,
                    borderColor: selected ? theme.colors.primary : "transparent",
                  }}
                >
                  <Avatar.Image
                    size={compact ? 46 : 40}
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
                        fontSize: compact ? 16 : 15,
                      }}
                      numberOfLines={1}
                    >
                      {friend?.displayName ?? "Friend"}
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.onSurfaceVariant,
                        fontSize: 13,
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
                      size={compact ? 18 : 16}
                      style={{
                        backgroundColor: theme.colors.error,
                        color: theme.colors.onError,
                      }}
                    >
                      !
                    </Badge>
                  ) : null}
                </Pressable>
              );
            })}
      </ScrollView>
    );
  };

  const renderDesktopPanel = () => (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
    >
      <Pressable
        onPress={handleCloseSheet}
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
            {renderConversationList("overlay")}
          </>
        )}
      </Surface>
    </View>
  );

  const renderCompactSheet = () => {
    const sheetHeight = height - sheetTopInset;
    return (
      <View
        pointerEvents="box-none"
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <Pressable
          onPress={handleCloseSheet}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(5, 7, 11, 0.45)",
          }}
        />
        <Surface
          elevation={8}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: sheetHeight,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            backgroundColor: theme.colors.surface,
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 20,
          }}
        >
          <View style={{ alignItems: "center", paddingVertical: 6 }}>
            <View
              style={{
                width: 42,
                height: 4,
                borderRadius: 999,
                backgroundColor: theme.colors.outlineVariant,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Text
              variant="titleLarge"
              style={{ fontWeight: "600", color: theme.colors.onSurface }}
            >
              Messages
            </Text>
            <IconButton icon="close" onPress={handleCloseSheet} accessibilityLabel="Close messages" />
          </View>
          {activeFriend ? (
            <ConversationView
              friend={activeFriend}
              onClose={() => setActiveFriendId(null)}
              style={{ flex: 1 }}
              currentUserId={user?.uid ?? null}
              sendMessage={sendMessage}
              markConversationRead={markConversationRead}
              closeIcon="back"
            />
          ) : (
            renderConversationList("compact")
          )}
        </Surface>
      </View>
    );
  };

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
            onPress={handleToggle}
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

        {visible ? (isCompact ? renderCompactSheet() : renderDesktopPanel()) : null}
      </View>
    </Portal>
  );
}
