import { useEffect, useMemo, useState } from "react";
import {
  Timestamp,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import useAuth from "@/features/auth/hooks/useAuth";
import { db } from "@/lib/firebase";

export type ConversationSummary = {
  id: string;
  friendUid: string;
  unread: boolean;
  lastMessageText: string;
  lastMessageSenderId: string | null;
  updatedAt: Date | null;
};

export function useConversationSummaries() {
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<ConversationSummary[]>([]);

  useEffect(() => {
    if (!user?.uid) {
      setSummaries([]);
      return;
    }

    const summariesQuery = query(
      collection(db, "conversations"),
      where("userIds", "array-contains", user.uid),
    );

    const unsubscribe = onSnapshot(
      summariesQuery,
      (snapshot) => {
        const next = snapshot.docs
          .map((docSnapshot) => {
            const data = docSnapshot.data() as {
              userIds?: string[];
              unreadBy?: string[];
              lastMessage?: { text?: string; senderId?: string; createdAt?: Timestamp };
              updatedAt?: Timestamp;
            };
            const userIds = Array.isArray(data.userIds) ? data.userIds : [];
            const friendUid = userIds.find((uid) => uid !== user.uid);
            if (!friendUid) {
              return null;
            }
            const unread =
              Array.isArray(data.unreadBy) && data.unreadBy.includes(user.uid);
            const updatedAt =
              data.updatedAt?.toDate?.() ??
              data.lastMessage?.createdAt?.toDate?.() ??
              null;
            return {
              id: docSnapshot.id,
              friendUid,
              unread,
              lastMessageText: data.lastMessage?.text ?? "",
              lastMessageSenderId: data.lastMessage?.senderId ?? null,
              updatedAt,
            } satisfies ConversationSummary;
          })
          .filter((item): item is ConversationSummary => Boolean(item))
          .sort((a, b) => {
            const aTime = a.updatedAt?.getTime?.() ?? 0;
            const bTime = b.updatedAt?.getTime?.() ?? 0;
            return bTime - aTime;
          });
        setSummaries(next);
      },
      (error) => {
        console.warn("Conversation summaries listener error", error);
        setSummaries([]);
      },
    );

    return unsubscribe;
  }, [user?.uid]);

  const unreadCount = useMemo(
    () => summaries.filter((summary) => summary.unread).length,
    [summaries],
  );

  return { summaries, unreadCount };
}

