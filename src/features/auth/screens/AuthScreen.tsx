import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import useAuth from "../hooks/useAuth";
import { AppTheme } from "@/app/theme/types";

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
  const {
    loading,
    authError,
    clearError,
    signInWithEmail,
    signUpWithEmail,
  signInWithGoogle,
} = useAuth();

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signUp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!email.trim() || !password.trim()) return false;
    if (mode === "signUp" && password !== confirmPassword) return false;
    return true;
  }, [confirmPassword, email, mode, password]);

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
      await signUpWithEmail(email, password);
    } else {
      await signInWithEmail(email, password);
    }
  };

  const handleToggleMode = () => {
    setMode((prev) => (prev === "signUp" ? "signIn" : "signUp"));
    setLocalError(null);
    clearError();
  };

  const handleToggleEmailForm = () => {
    setShowEmailForm(true);
    setMode("signUp");
    setLocalError(null);
    clearError();
  };

  const combinedError = localError ?? authError;

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={{ flex: 1, backgroundColor: "#f5f7ff" }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 48,
          paddingHorizontal: 24,
          gap: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 24,
            backgroundColor: "#6c63ff",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#6c63ff",
            shadowOpacity: 0.25,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 8 },
            elevation: 6,
          }}
        >
          <MaterialCommunityIcons name="controller-classic" size={42} color="#ffffff" />
        </View>

        <View style={{ alignItems: "center", maxWidth: 520 }}>
          <Text
            variant="headlineMedium"
            style={{ fontWeight: "700", color: "#1a1f2c", marginBottom: 4 }}
          >
            Game Night
          </Text>
          <Text
            style={{ fontSize: 16, color: "#3f4d5c", textAlign: "center", marginBottom: 12 }}
          >
            Organize amazing board game nights
          </Text>
          <Text style={{ color: "#6e7a8a", textAlign: "center" }}>
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
            backgroundColor: "#ffffff",
          }}
        >
          {FEATURE_ITEMS.map((item, index) => (
            <View
              key={item.title}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                borderBottomWidth: index === FEATURE_ITEMS.length - 1 ? 0 : StyleSheet.hairlineWidth,
                borderBottomColor: "#f0f2f7",
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
                <Text style={{ fontWeight: "600", color: "#1a1f2c" }}>{item.title}</Text>
                <Text style={{ color: "#6e7a8a", fontSize: 13, marginTop: 2 }}>
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
              buttonColor="#6c63ff"
              textColor="#ffffff"
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
                />
              )}

              <Button
                mode="contained"
                onPress={handleSubmit}
                disabled={!canSubmit || loading}
                contentStyle={{ paddingVertical: 6 }}
                buttonColor="#6c63ff"
                textColor="#ffffff"
                icon={mode === "signUp" ? "account-plus" : "login"}
              >
                {mode === "signUp" ? "Create Account" : "Sign In"}
              </Button>

              <Button
                mode="text"
                onPress={handleToggleMode}
                disabled={loading}
              >
                {mode === "signUp"
                  ? "Already have an account? Sign in"
                  : "Need an account? Create one"}
              </Button>
            </View>
          )}

          <View style={{ gap: 10, marginTop: showEmailForm ? 12 : 4 }}>
            <Button
              mode="outlined"
              disabled={loading}
              icon="google"
              onPress={signInWithGoogle}
            >
              Continue with Google
            </Button>
          </View>

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

        <Text style={{ color: "#6e7a8a", textAlign: "center" }}>
          Join thousands of board game enthusiasts worldwide
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

