import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Timestamp,
  addDoc,
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  runTransaction,
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
type FriendRequestStatus = "pending" | "accepted" | "declined";

type FriendRequest = {
  id: string;
  sender: FriendProfile;
  receiver: FriendProfile;
  status: FriendRequestStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

type UserProfileContextValue = {
  loadingProfile: boolean;
  loadingFriends: boolean;
  loadingFriendRequests: boolean;
  profile: UserProfile | null;
  friends: FriendProfile[];
  incomingFriendRequests: FriendRequest[];
  outgoingFriendRequests: FriendRequest[];
  addFriendByCode: (code: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendUid: string) => Promise<void>;
  sendMessage: (friendUid: string, text: string) => Promise<void>;
  markConversationRead: (friendUid: string) => Promise<void>;
};

const UserProfileContext = createContext<UserProfileContextValue | undefined>(
  undefined,
);

const emptyArray: FriendProfile[] = [];
const emptyRequests: FriendRequest[] = [];

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [friends, setFriends] = useState<FriendProfile[]>(emptyArray);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [incomingFriendRequests, setIncomingFriendRequests] = useState<FriendRequest[]>(
    emptyRequests,
  );
  const [outgoingFriendRequests, setOutgoingFriendRequests] = useState<FriendRequest[]>(
    emptyRequests,
  );
  const [loadingFriendRequests, setLoadingFriendRequests] = useState(false);
  const profileCache = useRef<Map<string, FriendProfile>>(new Map());

  const getCachedFriendProfile = useCallback(
    async (uid: string): Promise<FriendProfile | null> => {
      if (!uid) return null;
      const cached = profileCache.current.get(uid);
      if (cached) {
        return cached;
      }

      const ref = doc(db, "users", uid);
      const snapshot = await getDoc(ref);
      const data = snapshot.data();
      if (!data) return null;

      const friendProfile: FriendProfile = {
        uid,
        displayName: data.displayName ?? "Player",
        email: data.email ?? "",
        photoURL: data.photoURL ?? null,
        friendCode: data.friendCode ?? "",
        createdAt: data.createdAt as Timestamp | undefined,
        updatedAt: data.updatedAt as Timestamp | undefined,
      };
      profileCache.current.set(uid, friendProfile);
      return friendProfile;
    },
    [profileCache],
  );

  useEffect(() => {
    if (!user?.uid) {
      setProfile(null);
      setFriends(emptyArray);
      setIncomingFriendRequests(emptyRequests);
      setOutgoingFriendRequests(emptyRequests);
      setLoadingFriends(false);
      setLoadingFriendRequests(false);
      profileCache.current.clear();
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
        const nextProfile: UserProfile = {
          uid: user.uid,
          displayName: data.displayName ?? "Player",
          email: data.email ?? "",
          photoURL: data.photoURL ?? null,
          friendCode: data.friendCode ?? "",
          createdAt: data.createdAt as Timestamp | undefined,
          updatedAt: data.updatedAt as Timestamp | undefined,
        };
        profileCache.current.set(user.uid, nextProfile);
        setProfile(nextProfile);
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
              friendIds.map(async (friendId) => getCachedFriendProfile(friendId)),
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
  }, [getCachedFriendProfile, user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setIncomingFriendRequests(emptyRequests);
      setOutgoingFriendRequests(emptyRequests);
      setLoadingFriendRequests(false);
      return;
    }

    setLoadingFriendRequests(true);
    let isActive = true;
    let incomingReady = false;
    let outgoingReady = false;

    const markReady = () => {
      if (!isActive) return;
      if (incomingReady && outgoingReady) {
        setLoadingFriendRequests(false);
      }
    };

    const incomingQuery = query(collection(db, "friendRequests"), where("receiverId", "==", user.uid));

    const outgoingQuery = query(collection(db, "friendRequests"), where("senderId", "==", user.uid));

    const unsubscribeIncoming = onSnapshot(
      incomingQuery,
      (snapshot) => {
        void (async () => {
          try {
            const requests = await Promise.all(
              snapshot.docs.map(async (docSnap) => {
                const data = docSnap.data() as {
                  senderId?: string;
                  receiverId?: string;
                  status?: FriendRequestStatus;
                  createdAt?: Timestamp;
                  updatedAt?: Timestamp;
                };
                if (data.status && data.status !== "pending") {
                  return null;
                }

                const senderProfile = await getCachedFriendProfile(data.senderId ?? "");
                const receiverProfile =
                  profile?.uid === data.receiverId && profile
                    ? profile
                    : await getCachedFriendProfile(data.receiverId ?? "");

                if (!senderProfile || !receiverProfile) {
                  return null;
                }

                return {
                  id: docSnap.id,
                  sender: senderProfile,
                  receiver: receiverProfile,
                  status: data.status ?? "pending",
                  createdAt: data.createdAt,
                  updatedAt: data.updatedAt,
                } satisfies FriendRequest;
              }),
            );

            if (!isActive) return;
            setIncomingFriendRequests(
              requests.filter((item): item is FriendRequest => Boolean(item)),
            );
          } catch (error) {
            console.warn("Failed to load incoming friend requests", error);
            if (isActive) {
              setIncomingFriendRequests(emptyRequests);
            }
          } finally {
            incomingReady = true;
            markReady();
          }
        })();
      },
      (error) => {
        console.warn("Incoming friend requests subscription error", error);
        if (isActive) {
          setIncomingFriendRequests(emptyRequests);
        }
        incomingReady = true;
        markReady();
      },
    );

    const unsubscribeOutgoing = onSnapshot(
      outgoingQuery,
      (snapshot) => {
        void (async () => {
          try {
            const requests = await Promise.all(
              snapshot.docs.map(async (docSnap) => {
                const data = docSnap.data() as {
                  senderId?: string;
                  receiverId?: string;
                  status?: FriendRequestStatus;
                  createdAt?: Timestamp;
                  updatedAt?: Timestamp;
                };
                if (data.status && data.status !== "pending") {
                  return null;
                }

                const senderProfile =
                  profile?.uid === data.senderId && profile
                    ? profile
                    : await getCachedFriendProfile(data.senderId ?? "");
                const receiverProfile = await getCachedFriendProfile(data.receiverId ?? "");

                if (!senderProfile || !receiverProfile) {
                  return null;
                }

                return {
                  id: docSnap.id,
                  sender: senderProfile,
                  receiver: receiverProfile,
                  status: data.status ?? "pending",
                  createdAt: data.createdAt,
                  updatedAt: data.updatedAt,
                } satisfies FriendRequest;
              }),
            );

            if (!isActive) return;
            setOutgoingFriendRequests(
              requests.filter((item): item is FriendRequest => Boolean(item)),
            );
          } catch (error) {
            console.warn("Failed to load outgoing friend requests", error);
            if (isActive) {
              setOutgoingFriendRequests(emptyRequests);
            }
          } finally {
            outgoingReady = true;
            markReady();
          }
        })();
      },
      (error) => {
        console.warn("Outgoing friend requests subscription error", error);
        if (isActive) {
          setOutgoingFriendRequests(emptyRequests);
        }
        outgoingReady = true;
        markReady();
      },
    );

    return () => {
      isActive = false;
      unsubscribeIncoming();
      unsubscribeOutgoing();
    };
  }, [getCachedFriendProfile, profile, user?.uid]);

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
      const existingFriendship = await getDoc(friendshipRef);

      if (existingFriendship.exists()) {
        throw new Error("You're already friends.");
      }

      const pairKey = friendshipKey;
      const requestRef = doc(db, "friendRequests", pairKey);
      const existingRequest = await getDoc(requestRef);

      if (existingRequest.exists()) {
        const data = existingRequest.data() as {
          senderId?: string;
          receiverId?: string;
          status?: FriendRequestStatus;
        };

        if (data.status === "pending") {
          if (data.senderId === user.uid) {
            throw new Error("You already sent this player a friend request.");
          }
          if (data.receiverId === user.uid) {
            throw new Error("This player already requested you. Check your notifications.");
          }
          throw new Error("There's already a pending request between you.");
        }

        if (data.status === "accepted") {
          throw new Error("You're already friends.");
        }

        // Request was declined; allow replacing it by deleting first.
        await deleteDoc(requestRef);
      }

      await setDoc(requestRef, {
        senderId: user.uid,
        receiverId: friendUid,
        pairKey,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Preload the receiver profile for quicker UI updates.
      void getCachedFriendProfile(friendUid);
    },
    [getCachedFriendProfile, profile?.friendCode, user?.uid],
  );

  const acceptFriendRequest = useCallback(
    async (requestId: string) => {
      if (!user?.uid) {
        throw new Error("You need to be signed in to manage friend requests.");
      }

      const requestRef = doc(db, "friendRequests", requestId);
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(requestRef);
        if (!snapshot.exists()) {
          throw new Error("This request no longer exists.");
        }
        const data = snapshot.data() as {
          senderId?: string;
          receiverId?: string;
          status?: FriendRequestStatus;
        };

        if (!data.senderId || !data.receiverId) {
          throw new Error("This request is malformed.");
        }
        if (data.receiverId !== user.uid) {
          throw new Error("Only the recipient can accept this request.");
        }
        if (data.status !== "pending") {
          throw new Error("This request has already been processed.");
        }

        const friendshipKey = friendshipId(data.senderId, data.receiverId);
        const friendshipRef = doc(db, "friendships", friendshipKey);
        const friendshipSnapshot = await transaction.get(friendshipRef);

        if (!friendshipSnapshot.exists()) {
          transaction.set(friendshipRef, {
            userIds: [data.senderId, data.receiverId],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          transaction.update(friendshipRef, {
            updatedAt: serverTimestamp(),
          });
        }

        transaction.delete(requestRef);
      });
    },
    [user?.uid],
  );

  const declineFriendRequest = useCallback(
    async (requestId: string) => {
      if (!user?.uid) {
        throw new Error("You need to be signed in to manage friend requests.");
      }

      const requestRef = doc(db, "friendRequests", requestId);
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(requestRef);
        if (!snapshot.exists()) {
          return;
        }
        const data = snapshot.data() as {
          receiverId?: string;
          status?: FriendRequestStatus;
        };

        if (data.receiverId !== user.uid) {
          throw new Error("Only the recipient can decline this request.");
        }
        if (data.status !== "pending") {
          transaction.delete(requestRef);
          return;
        }

        transaction.delete(requestRef);
      });
    },
    [user?.uid],
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

  const markConversationRead = useCallback(
    async (friendUid: string) => {
      if (!user?.uid || !friendUid) {
        return;
      }
      try {
        const conversationKey = friendshipId(user.uid, friendUid);
        const conversationRef = doc(db, "conversations", conversationKey);
        await updateDoc(conversationRef, {
          unreadBy: arrayRemove(user.uid),
        });
      } catch (error) {
        console.warn("Failed to mark conversation as read", error);
      }
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
          unreadBy: friendUid === user.uid ? [] : [friendUid],
        });
      } else {
        const data = conversationSnapshot.data() as { userIds?: string[] };
        if (!Array.isArray(data.userIds) || data.userIds.length === 0) {
          await updateDoc(conversationRef, {
            userIds: [user.uid, friendUid],
          });
        }
      }

      const createdAt = serverTimestamp();
      const trimmed = text.trim();
      await addDoc(collection(conversationRef, "messages"), {
        text: trimmed,
        senderId: user.uid,
        createdAt,
      });

      let unreadBy: string[] = [];
      if (conversationSnapshot.exists()) {
        const data = conversationSnapshot.data() as { unreadBy?: string[] };
        unreadBy = Array.isArray(data.unreadBy)
          ? data.unreadBy.filter((id) => id !== user.uid)
          : [];
      }
      if (friendUid !== user.uid) {
        unreadBy = Array.from(new Set([...unreadBy, friendUid]));
      }

      await updateDoc(conversationRef, {
        userIds: [user.uid, friendUid],
        lastMessage: {
          text: trimmed,
          senderId: user.uid,
          createdAt,
        },
        updatedAt: serverTimestamp(),
        unreadBy,
      });
    },
    [user?.uid],
  );

  const value = useMemo<UserProfileContextValue>(
    () => ({
      loadingProfile,
      loadingFriends,
      loadingFriendRequests,
      profile,
      friends,
      incomingFriendRequests,
      outgoingFriendRequests,
      addFriendByCode,
      acceptFriendRequest,
      declineFriendRequest,
      removeFriend,
      sendMessage,
      markConversationRead,
    }),
    [
      acceptFriendRequest,
      addFriendByCode,
      declineFriendRequest,
      friends,
      incomingFriendRequests,
      loadingFriendRequests,
      loadingFriends,
      loadingProfile,
      outgoingFriendRequests,
      profile,
      removeFriend,
      sendMessage,
      markConversationRead,
    ],
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
