import { useEffect, useState } from "react";
import {
  Timestamp,
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import useAuth from "@/features/auth/hooks/useAuth";
import { db } from "@/lib/firebase";
import { friendshipId } from "@/features/profile/services/userProfileService";

export type ConversationMessage = {
  id: string;
  text: string;
  senderId: string;
  createdAt: Date;
};

export function useConversation(friendUid: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid || !friendUid) {
      setMessages([]);
      return;
    }

    setLoading(true);
    const conversationKey = friendshipId(user.uid, friendUid);
    const messagesQuery = query(
      collection(db, "conversations", conversationKey, "messages"),
      orderBy("createdAt", "asc"),
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
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
        setMessages([]);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [friendUid, user?.uid]);

  return { messages, loading };
}
