import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  signOut as firebaseSignOut,
  signInWithPopup,
} from "firebase/auth";

import { auth, googleAuthProvider } from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  loading: boolean;
  authError: string | null;
  clearError: () => void;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setInitializing(false);
      setAuthError("Authentication is not configured.");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const clearError = useCallback(() => setAuthError(null), []);

  const runWithLoading = useCallback(
    async (fn: () => Promise<unknown>) => {
      if (!auth) {
        setAuthError("Authentication is not configured.");
        return;
      }

      setLoading(true);
      setAuthError(null);
      try {
        await fn();
      } catch (error: unknown) {
        if (error instanceof Error) {
          setAuthError(error.message);
        } else {
          setAuthError("An unexpected authentication error occurred.");
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      await runWithLoading(() =>
        signInWithEmailAndPassword(auth, email.trim(), password),
      );
    },
    [runWithLoading],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      await runWithLoading(() =>
        createUserWithEmailAndPassword(auth, email.trim(), password),
      );
    },
    [runWithLoading],
  );

  const signInWithGoogle = useCallback(async () => {
    if (Platform.OS !== "web") {
      setAuthError("Google sign-in is currently supported on web only.");
      return;
    }

    await runWithLoading(() => signInWithPopup(auth, googleAuthProvider));
  }, [runWithLoading]);

  const signOut = useCallback(async () => {
    await runWithLoading(() => firebaseSignOut(auth));
  }, [runWithLoading]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      loading,
      authError,
      clearError,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
    }),
    [
      authError,
      clearError,
      initializing,
      loading,
      signInWithEmail,
      signInWithGoogle,
      signOut,
      signUpWithEmail,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}


