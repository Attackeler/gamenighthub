import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  StyleSheet,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  HelperText,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import useAuth from "../hooks/useAuth";
import { AppTheme } from "@/app/theme/types";
import { ThemeContext } from "@/app/providers/theme/ThemeContext";

type AuthMode = "signIn" | "signUp";

const FEATURE_ITEMS = [
  {
    icon: "calendar-blank-outline",
    title: "Schedule Game Nights",
    description: "Plan sessions with date, time, and location",
    iconColor: "#6c63ff",
  },
  {
    icon: "account-group-outline",
    title: "Invite Friends",
    description: "Build your gaming community and manage invites",
    iconColor: "#f7a600",
  },
  {
    icon: "trophy-outline",
    title: "Track Scores",
    description: "Record results and view statistics over time",
    iconColor: "#49c16c",
  },
  {
    icon: "star-outline",
    title: "Game Database",
    description: "Discover new games with tutorials and reviews",
    iconColor: "#a259ff",
  },
] as const;

export default function AuthScreen() {
  const theme = useTheme<AppTheme>();
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const {
    loading,
    authError,
    clearError,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    pendingVerificationEmail,
    verificationStatus,
    verifyEmailWithCode,
    resendVerificationEmail,
    sendPasswordReset,
  } = useAuth();

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signUp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!email.trim() || !password.trim()) return false;
    if (mode === "signUp" && password !== confirmPassword) return false;
    return true;
  }, [confirmPassword, email, mode, password]);

  useEffect(() => {
    if (verificationStatus === "sent") {
      setShowEmailForm(true);
    }
  }, [verificationStatus]);

  useEffect(() => {
    if (verificationStatus === "sent" && pendingVerificationEmail) {
      setInfoMessage((current) => {
        if (
          current &&
          current.toLowerCase().startsWith("we resent the verification code")
        ) {
          return current;
        }
        return `We sent a verification code to ${pendingVerificationEmail}. Paste it below to verify your email.`;
      });
    }
  }, [pendingVerificationEmail, verificationStatus]);

  const resetErrors = () => {
    clearError();
    setLocalError(null);
  };

  const handleSubmit = async () => {
    resetErrors();
    if (mode === "signUp" && password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    if (mode === "signUp") {
      const success = await signUpWithEmail(email, password);
      if (success) {
        const targetEmail = email.trim();
        setInfoMessage(
          `We sent a verification code to ${targetEmail}. Paste it below to verify your email.`,
        );
        setVerificationCode("");
      }
    } else {
      const success = await signInWithEmail(email, password);
      if (success) {
        setInfoMessage(null);
      }
    }
  };

  const handleToggleMode = () => {
    setMode((prev) => (prev === "signUp" ? "signIn" : "signUp"));
    setLocalError(null);
    clearError();
    setInfoMessage(null);
  };

  const handleToggleEmailForm = () => {
    setShowEmailForm(true);
    setMode("signUp");
    setLocalError(null);
    clearError();
    setInfoMessage(null);
  };

  const handleVerifyCode = async () => {
    resetErrors();
    const success = await verifyEmailWithCode(verificationCode);
    if (success) {
      setInfoMessage("Email verified! You're all set.");
      setVerificationCode("");
    }
  };

  const handleResendCode = async () => {
    resetErrors();
    const success = await resendVerificationEmail();
    if (success) {
      const targetEmail = pendingVerificationEmail ?? email.trim();
      if (targetEmail) {
        setInfoMessage(`We resent the verification code to ${targetEmail}.`);
      }
    }
  };

  const handlePasswordReset = async () => {
    resetErrors();
    const targetEmail = email.trim();
    if (!targetEmail) {
      setLocalError("Enter your email address to reset your password.");
      return;
    }
    const success = await sendPasswordReset(targetEmail);
    if (success) {
      setInfoMessage(`Password reset instructions were emailed to ${targetEmail}.`);
    }
  };

  const combinedError = localError ?? authError;

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 48,
          paddingHorizontal: 24,
          gap: 24,
          backgroundColor: theme.colors.background,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            alignSelf: "stretch",
            alignItems: "flex-end",
            maxWidth: 520,
            width: "100%",
          }}
        >
          <IconButton
            icon={isDark ? "white-balance-sunny" : "weather-night"}
            onPress={toggleTheme}
            mode="contained-tonal"
            size={22}
            containerColor={theme.colors.surfaceVariant}
            iconColor={theme.colors.onSurface}
            accessibilityRole="button"
            accessibilityLabel="Toggle color theme"
          />
        </View>

        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            backgroundColor: theme.colors.primary,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: theme.colors.primary,
            shadowOpacity: 0.25,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 8 },
            elevation: 6,
          }}
        >
          <MaterialCommunityIcons
            name="controller-classic"
            size={42}
            color={theme.colors.onPrimary}
          />
        </View>

        <View style={{ alignItems: "center", maxWidth: 520 }}>
          <Text
            variant="headlineMedium"
            style={{ fontWeight: "700", color: theme.colors.onBackground, marginBottom: 4 }}
          >
            Game Night
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: theme.colors.onSurfaceVariant,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Organize amazing board game nights
          </Text>
          <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
            Connect with friends, discover games, track scores
          </Text>
        </View>

        <Card
          mode="elevated"
          style={{
            width: "100%",
            maxWidth: 520,
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 20,
            backgroundColor: theme.colors.surface,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: theme.colors.outline,
          }}
        >
          {FEATURE_ITEMS.map((item, index) => (
            <View
              key={item.title}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                borderBottomWidth:
                  index === FEATURE_ITEMS.length - 1 ? 0 : StyleSheet.hairlineWidth,
                borderBottomColor: theme.colors.outline,
                gap: 16,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: `${item.iconColor}22`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialCommunityIcons name={item.icon} size={20} color={item.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "600", color: theme.colors.onSurface }}>
                  {item.title}
                </Text>
                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 13, marginTop: 2 }}>
                  {item.description}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        <View style={{ width: "100%", maxWidth: 520, gap: 12 }}>
          {!showEmailForm ? (
            <Button
              mode="contained"
              onPress={handleToggleEmailForm}
              contentStyle={{ paddingVertical: 6 }}
              icon="arrow-right"
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
            >
              Get Started
            </Button>
          ) : (
            <View style={{ gap: 12 }}>
              <TextInput
                label="Email"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  resetErrors();
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                mode="outlined"
                style={{ backgroundColor: theme.colors.surface }}
                textColor={theme.colors.onSurface}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
              />
              <TextInput
                label="Password"
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  resetErrors();
                }}
                secureTextEntry
                mode="outlined"
                style={{ backgroundColor: theme.colors.surface }}
                textColor={theme.colors.onSurface}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
              />
              {mode === "signUp" && (
                <TextInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    resetErrors();
                  }}
                  secureTextEntry
                  mode="outlined"
                  style={{ backgroundColor: theme.colors.surface }}
                  textColor={theme.colors.onSurface}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                />
              )}

              <Button
                mode="contained"
                onPress={handleSubmit}
                disabled={!canSubmit || loading}
                contentStyle={{ paddingVertical: 6 }}
                buttonColor={theme.colors.primary}
                textColor={theme.colors.onPrimary}
                icon={mode === "signUp" ? "account-plus" : "login"}
              >
                {mode === "signUp" ? "Create Account" : "Sign In"}
              </Button>

              <Button
                mode="text"
                onPress={handleToggleMode}
                disabled={loading}
                textColor={theme.colors.primary}
              >
                {mode === "signUp"
                  ? "Already have an account? Sign in"
                  : "Need an account? Create one"}
              </Button>

              {mode === "signIn" && (
                <Button
                  mode="text"
                  onPress={handlePasswordReset}
                  disabled={loading}
                  textColor={theme.colors.primary}
                >
                  Forgot password? Reset it
                </Button>
              )}
            </View>
          )}

          {showEmailForm && verificationStatus === "sent" && (
            <Card
              style={{
                padding: 16,
                borderRadius: 16,
                backgroundColor: theme.colors.surface,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: theme.colors.outline,
                gap: 12,
              }}
            >
              <Text style={{ color: theme.colors.onSurface }}>
                Enter the verification code we emailed to
                {pendingVerificationEmail ? ` ${pendingVerificationEmail}` : " your inbox"}.
              </Text>
              <TextInput
                label="Verification Code"
                value={verificationCode}
                onChangeText={(value) => {
                  setVerificationCode(value);
                  resetErrors();
                }}
                autoCapitalize="characters"
                autoCorrect={false}
                mode="outlined"
                style={{ backgroundColor: theme.colors.surface }}
                textColor={theme.colors.onSurface}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
              />
              <Button
                mode="contained"
                onPress={handleVerifyCode}
                disabled={!verificationCode.trim() || loading}
                buttonColor={theme.colors.primary}
                textColor={theme.colors.onPrimary}
              >
                Verify Email
              </Button>
              <Button
                mode="text"
                onPress={handleResendCode}
                disabled={loading}
                textColor={theme.colors.primary}
              >
                Resend verification code
              </Button>
            </Card>
          )}

          <View style={{ gap: 10, marginTop: showEmailForm ? 12 : 4 }}>
            <Button
              mode="outlined"
              disabled={loading}
              icon="google"
              onPress={signInWithGoogle}
              textColor={theme.colors.onSurface}
            >
              Continue with Google
            </Button>
          </View>

          {infoMessage && (
            <Text style={{ color: theme.colors.primary, textAlign: "center" }}>
              {infoMessage}
            </Text>
          )}

          {loading && (
            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 12 }}>
              <ActivityIndicator animating size="small" />
            </View>
          )}

          {combinedError && (
            <HelperText type="error" visible style={{ textAlign: "center" }}>
              {combinedError}
            </HelperText>
          )}
        </View>

        <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
          Join thousands of board game enthusiasts worldwide
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

