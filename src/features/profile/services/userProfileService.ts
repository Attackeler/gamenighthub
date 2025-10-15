import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type { User } from "firebase/auth";

import { db } from "@/lib/firebase";

export type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  friendCode: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

const FRIEND_CODE_LENGTH = 8;
const FRIEND_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVXYZ23456789";

async function generateUniqueFriendCode(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = Array.from({ length: FRIEND_CODE_LENGTH }, () => {
      const index = Math.floor(Math.random() * FRIEND_CODE_ALPHABET.length);
      return FRIEND_CODE_ALPHABET[index];
    }).join("");

    const existing = await getDocs(
      query(
        collection(db, "users"),
        where("friendCode", "==", candidate),
        limit(1),
      ),
    );

    if (existing.empty) {
      return candidate;
    }
  }

  throw new Error("Failed to generate a unique friend ID. Try again.");
}

const defaultDisplayName = (user: User) => {
  if (user.displayName?.trim()) {
    return user.displayName.trim();
  }
  if (user.email) {
    const [name] = user.email.split("@");
    return name || "Player";
  }
  return "Player";
};

export async function ensureUserProfile(user: User): Promise<void> {
  if (!user.uid) return;

  const ref = doc(db, "users", user.uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    const friendCode = await generateUniqueFriendCode();
    await setDoc(ref, {
      uid: user.uid,
      email: user.email ?? "",
      displayName: defaultDisplayName(user),
      photoURL: user.photoURL ?? null,
      friendCode,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return;
  }

  const data = snapshot.data();
  const updatePayload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (!data.friendCode) {
    updatePayload.friendCode = await generateUniqueFriendCode();
  }

  const resolvedDisplayName = defaultDisplayName(user);
  if (resolvedDisplayName !== data.displayName) {
    updatePayload.displayName = resolvedDisplayName;
  }

  if ((user.email ?? "") !== (data.email ?? "")) {
    updatePayload.email = user.email ?? "";
  }

  if ((user.photoURL ?? null) !== (data.photoURL ?? null)) {
    updatePayload.photoURL = user.photoURL ?? null;
  }

  if (Object.keys(updatePayload).length > 1) {
    await updateDoc(ref, updatePayload);
  }
}

export const friendshipId = (uidA: string, uidB: string) =>
  [uidA, uidB].sort().join("_");
