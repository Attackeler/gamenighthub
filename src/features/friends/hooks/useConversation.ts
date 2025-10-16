import { useEffect, useState } from "react";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { friendshipId } from "@/features/profile/services/userProfileService";

export type ConversationMessage = {
  id: string;
  text: string;
  senderId: string;
  createdAt: Date;
};

export function useConversation(friendUid: string | null, currentUserId: string | null) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUserId || !friendUid) {
      setMessages([]);
      setLoading(false);
      return;
    }

    let isActive = true;
    let unsubscribe: (() => void) | null = null;

    setLoading(true);
    const conversationKey = friendshipId(currentUserId, friendUid);
    const conversationRef = doc(db, "conversations", conversationKey);

    (async () => {
      try {
        const snapshot = await getDoc(conversationRef);
        if (!snapshot.exists()) {
          await setDoc(conversationRef, {
            userIds: [currentUserId, friendUid],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          const data = snapshot.data() as { userIds?: string[] };
          if (!Array.isArray(data.userIds) || data.userIds.length === 0) {
            await updateDoc(conversationRef, {
              userIds: [currentUserId, friendUid],
              updatedAt: serverTimestamp(),
            });
          } else if (
            (!data.userIds.includes(currentUserId) || !data.userIds.includes(friendUid)) &&
            data.userIds.length <= 4
          ) {
            // Ensure both participants are recorded without duplicating entries.
            const nextUserIds = Array.from(new Set([...data.userIds, currentUserId, friendUid]));
            await updateDoc(conversationRef, {
              userIds: nextUserIds,
              updatedAt: serverTimestamp(),
            });
          }
        }
      } catch (error) {
        console.warn("Failed to ensure conversation document", error);
        if (isActive) {
          setMessages([]);
          setLoading(false);
        }
        return;
      }

      if (!isActive) {
        return;
      }

      const messagesQuery = query(
        collection(db, "conversations", conversationKey, "messages"),
        orderBy("createdAt", "asc"),
      );

      unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot) => {
          if (!isActive) return;
          setMessages(
            snapshot.docs.map((docSnapshot) => {
              const data = docSnapshot.data() as {
                text?: string;
                senderId?: string;
                createdAt?: Timestamp;
              };
              return {
                id: docSnapshot.id,
                text: data.text ?? "",
                senderId: data.senderId ?? "",
                createdAt: data.createdAt?.toDate?.() ?? new Date(),
              };
            }),
          );
          setLoading(false);
        },
        (error) => {
          console.warn("Conversation listener error", error);
          if (!isActive) return;
          setMessages([]);
          setLoading(false);
        },
      );
    })();

    return () => {
      isActive = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [friendUid, currentUserId]);

  return { messages, loading };
}
