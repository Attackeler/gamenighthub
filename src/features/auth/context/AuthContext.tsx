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
  applyActionCode,
  reload,
  sendPasswordResetEmail,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth, googleAuthProvider } from "@/lib/firebase";
import { ensureUserProfile } from "@/features/profile/services/userProfileService";

type VerificationStatus = "idle" | "sent" | "verified";

type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  loading: boolean;
  authError: string | null;
  pendingVerificationEmail: string | null;
  verificationStatus: VerificationStatus;
  isEmailVerified: boolean;
  clearError: () => void;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string) => Promise<boolean>;
  verifyEmailWithCode: (code: string) => Promise<boolean>;
  resendVerificationEmail: () => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

const rawFunctionsBaseUrl = process.env.EXPO_PUBLIC_FUNCTIONS_URL ?? "";
const FUNCTIONS_BASE_URL =
  rawFunctionsBaseUrl === ""
    ? null
    : rawFunctionsBaseUrl.endsWith("/")
      ? rawFunctionsBaseUrl.slice(0, -1)
      : rawFunctionsBaseUrl;

async function requestVerificationEmail(idToken: string, email: string) {
  if (!FUNCTIONS_BASE_URL) {
    throw new Error(
      "Verification email service is not configured. Set EXPO_PUBLIC_FUNCTIONS_URL.",
    );
  }

  const response = await fetch(`${FUNCTIONS_BASE_URL}/sendVerificationEmail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    let fallback = "Failed to send verification email.";
    try {
      const data = await response.json();
      if (data?.error) {
        fallback = String(data.error);
      }
    } catch {
      const text = await response.text();
      if (text) {
        fallback = text;
      }
    }
    throw new Error(fallback);
  }
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("idle");

  useEffect(() => {
    if (!auth) {
      setInitializing(false);
      setAuthError("Authentication is not configured.");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser?.email && !firebaseUser.emailVerified) {
        setPendingVerificationEmail(firebaseUser.email);
        setVerificationStatus("sent");
      } else if (firebaseUser?.emailVerified) {
        setPendingVerificationEmail(null);
        setVerificationStatus("verified");
      } else {
        setPendingVerificationEmail(null);
        setVerificationStatus("idle");
      }

      if (firebaseUser) {
        ensureUserProfile(firebaseUser).catch((error) => {
          console.warn("Failed to ensure user profile", error);
        });
      }

      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const clearError = useCallback(() => setAuthError(null), []);

  const runWithLoading = useCallback(
    async (fn: () => Promise<unknown>): Promise<boolean> => {
      if (!auth) {
        setAuthError("Authentication is not configured.");
        return false;
      }

      setLoading(true);
      setAuthError(null);
      try {
        await fn();
        return true;
      } catch (error: unknown) {
        if (error instanceof Error) {
          setAuthError(error.message);
        } else {
          setAuthError("An unexpected authentication error occurred.");
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      return runWithLoading(async () => {
        const trimmedEmail = email.trim();
        let credential;
        try {
          credential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        } catch (error: unknown) {
          if (error instanceof FirebaseError && error.code === "auth/user-not-found") {
            throw new Error("We couldn't find an account with that email. Try signing up first.");
          }
          throw error;
        }

        await ensureUserProfile(credential.user);

        if (!credential.user.emailVerified) {
          const targetEmail = credential.user.email ?? trimmedEmail;
          const idToken = await credential.user.getIdToken(true);
          await requestVerificationEmail(idToken, targetEmail);
          setPendingVerificationEmail(targetEmail);
          setVerificationStatus("sent");
          throw new Error(
            "We sent a verification code to your email. Paste it below to finish setting up your account.",
          );
        }

        setPendingVerificationEmail(null);
        setVerificationStatus("verified");
      });
    },
    [runWithLoading],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      return runWithLoading(async () => {
        const trimmedEmail = email.trim();
        const existingMethods = await fetchSignInMethodsForEmail(auth, trimmedEmail);
        if (existingMethods.length > 0) {
          throw new Error("An account with this email already exists. Please sign in instead.");
        }

        const credential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        await ensureUserProfile(credential.user);
        const targetEmail = credential.user.email ?? trimmedEmail;
        const idToken = await credential.user.getIdToken(true);
        await requestVerificationEmail(idToken, targetEmail);
        setPendingVerificationEmail(targetEmail);
        setVerificationStatus("sent");
      });
    },
    [runWithLoading],
  );

  const verifyEmailWithCode = useCallback(
    async (code: string) => {
      return runWithLoading(async () => {
        const trimmedCode = code.trim();
        if (!trimmedCode) {
          throw new Error("Enter the verification code that was emailed to you.");
        }

        await applyActionCode(auth, trimmedCode);
        if (auth.currentUser) {
          await reload(auth.currentUser);
        }

        setPendingVerificationEmail(null);
        setVerificationStatus("verified");
      });
    },
    [runWithLoading],
  );

  const resendVerificationEmail = useCallback(async () => {
    return runWithLoading(async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("Sign in with your email and password before requesting a new code.");
      }

      const emailToUse = currentUser.email ?? pendingVerificationEmail;
      if (!emailToUse) {
        throw new Error("We need an email address to send a verification code.");
      }

      const idToken = await currentUser.getIdToken(true);
      await requestVerificationEmail(idToken, emailToUse);
      setPendingVerificationEmail(emailToUse);
      setVerificationStatus("sent");
    });
  }, [pendingVerificationEmail, runWithLoading]);

  const sendPasswordReset = useCallback(
    async (email: string) => {
      return runWithLoading(async () => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
          throw new Error("Enter the email address associated with your account.");
        }

        await sendPasswordResetEmail(auth, trimmedEmail);
      });
    },
    [runWithLoading],
  );

  const signInWithGoogle = useCallback(async () => {
    if (Platform.OS !== "web") {
      setAuthError("Google sign-in is currently supported on web only.");
      return;
    }

      return runWithLoading(async () => {
        const credential = await signInWithPopup(auth, googleAuthProvider);
        await ensureUserProfile(credential.user);
        if (!credential.user.emailVerified) {
          const targetEmail = credential.user.email;
          if (!targetEmail) {
            throw new Error("We couldn't determine your Google account email.");
          }
        const idToken = await credential.user.getIdToken(true);
        await requestVerificationEmail(idToken, targetEmail);
        setPendingVerificationEmail(targetEmail);
        setVerificationStatus("sent");
        throw new Error(
          "We sent a verification code to your Google email. Paste it below to finish signing in.",
        );
      }

      setPendingVerificationEmail(null);
      setVerificationStatus("verified");
    });
  }, [runWithLoading]);

  const signOut = useCallback(async () => {
    return runWithLoading(() => firebaseSignOut(auth));
  }, [runWithLoading]);

  const isEmailVerified =
    (user?.emailVerified ?? false) || verificationStatus === "verified";

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      loading,
      authError,
      pendingVerificationEmail,
      verificationStatus,
      isEmailVerified,
      clearError,
      signInWithEmail,
      signUpWithEmail,
      verifyEmailWithCode,
      resendVerificationEmail,
      sendPasswordReset,
      signInWithGoogle,
      signOut,
    }),
    [
      authError,
      clearError,
      initializing,
      isEmailVerified,
      loading,
      pendingVerificationEmail,
      resendVerificationEmail,
      sendPasswordReset,
      signInWithEmail,
      signInWithGoogle,
      signOut,
      signUpWithEmail,
      user,
      verificationStatus,
      verifyEmailWithCode,
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


