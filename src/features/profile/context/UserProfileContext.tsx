import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import useAuth from "@/features/auth/hooks/useAuth";
import { db } from "@/lib/firebase";
import {
  UserProfile,
  friendshipId,
} from "@/features/profile/services/userProfileService";

type FriendProfile = UserProfile;

type UserProfileContextValue = {
  loadingProfile: boolean;
  loadingFriends: boolean;
  profile: UserProfile | null;
  friends: FriendProfile[];
  addFriendByCode: (code: string) => Promise<void>;
  removeFriend: (friendUid: string) => Promise<void>;
  sendMessage: (friendUid: string, text: string) => Promise<void>;
};

const UserProfileContext = createContext<UserProfileContextValue | undefined>(
  undefined,
);

const emptyArray: FriendProfile[] = [];

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [friends, setFriends] = useState<FriendProfile[]>(emptyArray);
  const [loadingFriends, setLoadingFriends] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setProfile(null);
      setFriends(emptyArray);
      return;
    }

    setLoadingProfile(true);
    const userRef = doc(db, "users", user.uid);
    const unsubscribeProfile = onSnapshot(
      userRef,
      (snapshot) => {
        const data = snapshot.data();
        if (!data) {
          setProfile(null);
          setLoadingProfile(false);
          return;
        }
        setProfile({
          uid: user.uid,
          displayName: data.displayName ?? "Player",
          email: data.email ?? "",
          photoURL: data.photoURL ?? null,
          friendCode: data.friendCode ?? "",
          createdAt: data.createdAt as Timestamp | undefined,
          updatedAt: data.updatedAt as Timestamp | undefined,
        });
        setLoadingProfile(false);
      },
      (error) => {
        console.warn("Profile subscription error", error);
        setProfile(null);
        setLoadingProfile(false);
      },
    );

    setLoadingFriends(true);
    const friendshipsQuery = query(
      collection(db, "friendships"),
      where("userIds", "array-contains", user.uid),
    );

    let isCurrent = true;

    const unsubscribeFriends = onSnapshot(
      friendshipsQuery,
      (snapshot) => {
        const friendIds = snapshot.docs
          .map((docSnap) => {
            const users = docSnap.data()?.userIds as string[] | undefined;
            if (!Array.isArray(users)) return null;
            return users.find((id) => id !== user.uid) ?? null;
          })
          .filter((id): id is string => Boolean(id));

        if (friendIds.length === 0) {
          if (isCurrent) {
            setFriends(emptyArray);
            setLoadingFriends(false);
          }
          return;
        }

        const loadFriends = async () => {
          try {
            const docs = await Promise.all(
              friendIds.map(async (friendId) => {
                const ref = doc(db, "users", friendId);
                const friendSnapshot = await getDoc(ref);
                const data = friendSnapshot.data();
                if (!data) return null;
                return {
                  uid: friendId,
                  displayName: data.displayName ?? "Player",
                  email: data.email ?? "",
                  photoURL: data.photoURL ?? null,
                  friendCode: data.friendCode ?? "",
                  createdAt: data.createdAt as Timestamp | undefined,
                  updatedAt: data.updatedAt as Timestamp | undefined,
                } satisfies FriendProfile;
              }),
            );

            if (!isCurrent) return;
            setFriends(docs.filter((item): item is FriendProfile => Boolean(item)));
            setLoadingFriends(false);
          } catch (error) {
            console.warn("Failed to load friend profiles", error);
            if (isCurrent) {
              setFriends(emptyArray);
              setLoadingFriends(false);
            }
          }
        };

        void loadFriends();
      },
      (error) => {
        console.warn("Friend subscription error", error);
        if (isCurrent) {
          setFriends(emptyArray);
          setLoadingFriends(false);
        }
      },
    );

    return () => {
      isCurrent = false;
      unsubscribeProfile();
      unsubscribeFriends();
    };
  }, [user?.uid]);

  const addFriendByCode = useCallback(
    async (code: string) => {
      const trimmed = code.trim().toUpperCase();
      if (!user?.uid) {
        throw new Error("You need to be signed in to add friends.");
      }
      if (!trimmed) {
        throw new Error("Enter a friend ID.");
      }
      if (trimmed === (profile?.friendCode ?? "").toUpperCase()) {
        throw new Error("That's your own friend ID.");
      }

      const matches = await getDocs(
        query(collection(db, "users"), where("friendCode", "==", trimmed), limit(1)),
      );
      if (matches.empty) {
        throw new Error("No player found with that ID.");
      }

      const friendDoc = matches.docs[0];
      const friendUid = friendDoc.id;

      const friendshipKey = friendshipId(user.uid, friendUid);
      const friendshipRef = doc(db, "friendships", friendshipKey);
      const existing = await getDoc(friendshipRef);

      if (existing.exists()) {
        throw new Error("You're already friends.");
      }

      await setDoc(friendshipRef, {
        userIds: [user.uid, friendUid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    [profile?.friendCode, user?.uid],
  );

  const removeFriend = useCallback(
    async (friendUid: string) => {
      if (!user?.uid) {
        throw new Error("You need to be signed in to manage friends.");
      }
      const friendshipKey = friendshipId(user.uid, friendUid);
      await deleteDoc(doc(db, "friendships", friendshipKey));
    },
    [user?.uid],
  );

  const sendMessage = useCallback(
    async (friendUid: string, text: string) => {
      if (!user?.uid) {
        throw new Error("You need to be signed in to send messages.");
      }
      if (!text.trim()) {
        return;
      }

      const friendshipKey = friendshipId(user.uid, friendUid);
      const friendshipRef = doc(db, "friendships", friendshipKey);
      const friendshipSnapshot = await getDoc(friendshipRef);
      if (!friendshipSnapshot.exists()) {
        throw new Error("You can only message your friends.");
      }

      const conversationRef = doc(db, "conversations", friendshipKey);
      const conversationSnapshot = await getDoc(conversationRef);

      if (!conversationSnapshot.exists()) {
        await setDoc(conversationRef, {
          userIds: [user.uid, friendUid],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(conversationRef, {
          updatedAt: serverTimestamp(),
        });
      }

      const createdAt = serverTimestamp();
      await addDoc(collection(conversationRef, "messages"), {
        text: text.trim(),
        senderId: user.uid,
        createdAt,
      });
      await updateDoc(conversationRef, {
        lastMessage: {
          text: text.trim(),
          senderId: user.uid,
          createdAt,
        },
        updatedAt: serverTimestamp(),
      });
    },
    [user?.uid],
  );

  const value = useMemo<UserProfileContextValue>(
    () => ({
      loadingProfile,
      loadingFriends,
      profile,
      friends,
      addFriendByCode,
      removeFriend,
      sendMessage,
    }),
    [addFriendByCode, friends, loadingFriends, loadingProfile, profile, removeFriend, sendMessage],
  );

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
}
