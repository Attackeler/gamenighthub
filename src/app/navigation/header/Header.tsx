import React, { useContext, useMemo, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  ActivityIndicator,
  Appbar,
  Badge,
  Button,
  Divider,
  Portal,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@/shared/icons';

import { AppTheme } from '@/app/theme/types';
import { ThemeContext } from '@/app/providers/theme/ThemeContext';
import useAuth from '@/features/auth/hooks/useAuth';
import { useUserProfile } from '@/features/profile/context/UserProfileContext';
import { useNavigation } from '@react-navigation/native';

export default function Header() {
  const theme = useTheme<AppTheme>();
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { signOut, user } = useAuth();
  const navigation = useNavigation<any>();
  const {
    incomingFriendRequests,
    loadingFriendRequests,
    acceptFriendRequest,
    declineFriendRequest,
  } = useUserProfile();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<{
    id: string;
    action: 'accept' | 'decline';
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const anchorRef = useRef<View | null>(null);
  const [anchorLayout, setAnchorLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const pendingFriendRequestCount = useMemo(
    () => incomingFriendRequests.length,
    [incomingFriendRequests],
  );
  const menuWidth = useMemo(() => {
    const candidate = windowWidth - 32;
    if (!Number.isFinite(candidate)) {
      return 288;
    }
    // Keep menu compact on narrow screens and cap it on wide displays.
    const clamped = Math.min(Math.max(candidate, 240), 300);
    return clamped;
  }, [windowWidth]);
  const dropdownTop = useMemo(() => {
    if (anchorLayout) {
      return anchorLayout.y + anchorLayout.height + 8;
    }
    // Fallback just below a typical 56px header.
    return 64;
  }, [anchorLayout]);
  const dropdownLeft = useMemo(() => {
    const margin = 16;
    const maxLeft = windowWidth - menuWidth - margin;
    if (!anchorLayout) {
      return Math.max(margin, maxLeft);
    }
    const anchorCenter = anchorLayout.x + anchorLayout.width / 2;
    const proposedLeft = anchorCenter - menuWidth / 2;
    const clampedLeft = Math.min(Math.max(proposedLeft, margin), maxLeft);
    return clampedLeft;
  }, [anchorLayout, menuWidth, windowWidth]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.warn('Failed to sign out', error);
    }
  };

  const measureAnchor = () => {
    const node = anchorRef.current;
    if (node && typeof node.measureInWindow === 'function') {
      node.measureInWindow((x, y, width, height) => {
        setAnchorLayout({ x, y, width, height });
      });
    } else {
      setAnchorLayout(null);
    }
  };

  const toggleNotifications = () => {
    setErrorMessage(null);
    if (notificationsVisible) {
      setNotificationsVisible(false);
      return;
    }
    measureAnchor();
    setNotificationsVisible(true);
  };

  const handleAcceptFriendRequest = async (requestId: string) => {
    setProcessingRequest({ id: requestId, action: 'accept' });
    setErrorMessage(null);
    try {
      await acceptFriendRequest(requestId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "We couldn't accept that request right now.";
      setErrorMessage(message);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDeclineFriendRequest = async (requestId: string) => {
    setProcessingRequest({ id: requestId, action: 'decline' });
    setErrorMessage(null);
    try {
      await declineFriendRequest(requestId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "We couldn't decline that request right now.";
      setErrorMessage(message);
    } finally {
      setProcessingRequest(null);
    }
  };

  React.useEffect(() => {
    if (!notificationsVisible) {
      return;
    }
    measureAnchor();
  }, [notificationsVisible, windowWidth, windowHeight]);

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: 1000,
            width: '100%',
            paddingHorizontal: 16,
            marginHorizontal: 'auto',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="view-dashboard" size={30} color={theme.colors.primary} />
            <Text variant="titleLarge" style={{ marginLeft: 8, fontWeight: 'bold' }}>
              Game Night
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 16 }}>
              <Ionicons
                name={isDark ? 'sunny-outline' : 'moon-outline'}
                size={24}
                color={theme.colors.onBackground}
              />
            </TouchableOpacity>

            <View ref={anchorRef} style={{ marginRight: 16 }}>
              <TouchableOpacity onPress={toggleNotifications}>
                <View>
                  <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
                  {pendingFriendRequestCount > 0 ? (
                    <Badge
                      size={16}
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -10,
                        backgroundColor: theme.colors.primary,
                        color: theme.colors.onPrimary,
                      }}
                    >
                      {pendingFriendRequestCount}
                    </Badge>
                  ) : null}
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleSignOut}
              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
            >
              <MaterialCommunityIcons
                name="logout"
                size={22}
                color={theme.colors.onBackground}
                style={{ marginRight: 6 }}
              />
              <Text style={{ color: theme.colors.onBackground, fontWeight: '600' }}>
                Sign out
              </Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Image
                source={{ uri: user?.photoURL ?? 'https://i.pravatar.cc/80' }}
                style={{ width: 34, height: 34, borderRadius: 100 }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        </View>
      </Appbar.Header>
      {notificationsVisible ? (
        <Portal>
          <View
            pointerEvents="box-none"
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <Pressable
              onPress={() => setNotificationsVisible(false)}
              style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            />
            <Surface
              elevation={4}
              style={{
                position: 'absolute',
                top: dropdownTop,
                left: dropdownLeft,
                width: menuWidth,
                maxWidth: windowWidth - 32,
                borderRadius: 16,
                backgroundColor: theme.colors.surface,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomColor: theme.colors.outlineVariant,
                  borderBottomWidth: 1,
                }}
              >
                <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                  Notifications
                </Text>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>
                  Friend requests appear here.
                </Text>
                {errorMessage ? (
                  <Text style={{ color: theme.colors.error, marginTop: 4 }}>{errorMessage}</Text>
                ) : null}
              </View>

              <ScrollView style={{ maxHeight: 320 }}>
                {loadingFriendRequests ? (
                  <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                    <ActivityIndicator />
                  </View>
                ) : pendingFriendRequestCount === 0 ? (
                  <View style={{ paddingHorizontal: 16, paddingVertical: 20 }}>
                    <Text style={{ color: theme.colors.onSurfaceVariant }}>
                      You're all caught up.
                    </Text>
                    <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                      Share your friend ID so others can connect with you.
                    </Text>
                  </View>
                ) : (
                  incomingFriendRequests.map((request) => {
                    const isProcessing = processingRequest?.id === request.id;
                    const accepting =
                      isProcessing && processingRequest?.action === 'accept';
                    const declining =
                      isProcessing && processingRequest?.action === 'decline';

                    return (
                      <View
                        key={request.id}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 14,
                          borderBottomColor: theme.colors.outlineVariant,
                          borderBottomWidth: 1,
                          gap: 12,
                        }}
                      >
                        <Text style={{ fontWeight: '600', color: theme.colors.onSurface }}>
                          {request.sender.displayName}
                        </Text>
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>
                          {request.sender.email}
                        </Text>
                        <Text
                          style={{
                            color: theme.colors.primary,
                            fontWeight: '600',
                            letterSpacing: 1.5,
                          }}
                        >
                          ID: {request.sender.friendCode}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <Button
                            mode="contained"
                            onPress={() => handleAcceptFriendRequest(request.id)}
                            loading={accepting}
                            disabled={Boolean(processingRequest) && !accepting}
                            style={{ flex: 1 }}
                          >
                            Accept
                          </Button>
                          <Button
                            mode="outlined"
                            onPress={() => handleDeclineFriendRequest(request.id)}
                            loading={declining}
                            disabled={Boolean(processingRequest) && !declining}
                            textColor={theme.colors.error}
                            style={{ flex: 1 }}
                          >
                            Decline
                          </Button>
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>

              <View style={{ padding: 12 }}>
                <Button
                  mode="text"
                  onPress={() => {
                    setNotificationsVisible(false);
                    navigation.navigate('friends');
                  }}
                >
                  Manage friends
                </Button>
              </View>
            </Surface>
          </View>
        </Portal>
      ) : null}
      <Divider
        style={{
          backgroundColor: theme.colors.divider,
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: 960,
          width: '90%',
          height: 1,
          marginHorizontal: 'auto',
          marginBottom: 8,
        }}
      />
    </View>
  );
}
