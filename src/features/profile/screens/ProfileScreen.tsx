import React, { useState } from "react";
import { Image, View } from "react-native";
import { Button, Card, Divider, IconButton, Snackbar, Text, useTheme } from "react-native-paper";
import * as Clipboard from "expo-clipboard";

import { AppTheme } from "@/app/theme/types";
import useAuth from "@/features/auth/hooks/useAuth";
import { useUserProfile } from "@/features/profile/context/UserProfileContext";

export default function ProfileScreen() {
  const theme = useTheme<AppTheme>();
  const { user, signOut, loading } = useAuth();
  const { profile, loadingProfile } = useUserProfile();
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const friendCode = profile?.friendCode ?? "••••••••";

  const handleCopy = async () => {
    if (!profile?.friendCode) return;
    await Clipboard.setStringAsync(profile.friendCode);
    setSnackbarVisible(true);
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        backgroundColor: theme.colors.background,
        alignItems: "center",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 20,
          padding: 24,
          backgroundColor: theme.colors.surface,
          gap: 16,
        }}
      >
        <View style={{ alignItems: "center", gap: 12 }}>
          <Image
            source={{ uri: user?.photoURL ?? "https://i.pravatar.cc/180" }}
            style={{ width: 96, height: 96, borderRadius: 48 }}
          />
          <Text variant="titleLarge" style={{ fontWeight: "700", color: theme.colors.onSurface }}>
            {profile?.displayName ?? user?.email ?? "Player"}
          </Text>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>{user?.email}</Text>
        </View>

        <Divider />

        <View style={{ gap: 12 }}>
          <Text style={{ fontWeight: "600", color: theme.colors.onSurface }}>
            Your Friend ID
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderWidth: 1,
              borderColor: theme.colors.outline,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <Text
              selectable
              style={{ letterSpacing: 2, fontWeight: "700", color: theme.colors.onSurface }}
            >
              {friendCode}
            </Text>
            <IconButton
              icon="content-copy"
              mode="contained-tonal"
              disabled={loadingProfile || !profile?.friendCode}
              onPress={handleCopy}
              accessibilityLabel="Copy friend ID"
            />
          </View>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            Share this ID with other players so they can send you a friend request.
          </Text>
        </View>

        <Divider />

        <Button
          mode="contained"
          icon="logout"
          disabled={loading}
          onPress={() => {
            void signOut();
          }}
        >
          Sign out
        </Button>
      </Card>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
      >
        Friend ID copied to clipboard
      </Snackbar>
    </View>
  );
}
