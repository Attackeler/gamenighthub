import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type FirestoreError,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { GameNight } from "../screens/home/HomeScreen.types";
import type { FriendOption } from "@/features/games/components/game-night-modal/mockData";

export type GameNightInviteDoc = {
  nightId: string;
  ownerId: string;
  ownerName: string;
  ownerPhotoURL?: string | null;
  inviterId: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  status: "pending" | "accepted" | "declined";
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type GameNightInvite = GameNightInviteDoc & {
  id: string;
};

export type FirestoreGameNight = {
  ownerId: string;
  ownerName: string;
  ownerEmail?: string;
  ownerPhotoURL?: string | null;
  title: string;
  date: string;
  time?: string;
  location: string;
  invitedFriends: FriendOption[];
  invitedFriendIds: string[];
  acceptedFriendIds: string[];
  selectedGames: GameNight["selectedGames"];
  status: GameNight["status"];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type GameNightListener = (nights: GameNight[]) => void;
export type InviteListener = (invites: GameNightInvite[]) => void;

export function listenToOwnedGameNights(
  uid: string,
  handler: GameNightListener,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  const ownedQuery = query(collection(db, "gameNights"), where("ownerId", "==", uid));

  return onSnapshot(
    ownedQuery,
    (snapshot) => {
      const nights = snapshot.docs.map((docSnapshot) => transformNightDoc(docSnapshot.id, docSnapshot.data() as FirestoreGameNight));
      handler(nights);
    },
    onError,
  );
}

export function listenToAcceptedGameNights(
  uid: string,
  handler: GameNightListener,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  const acceptedQuery = query(
    collection(db, "gameNights"),
    where("acceptedFriendIds", "array-contains", uid),
  );

  return onSnapshot(
    acceptedQuery,
    (snapshot) => {
      const nights = snapshot.docs.map((docSnapshot) => transformNightDoc(docSnapshot.id, docSnapshot.data() as FirestoreGameNight));
      handler(nights);
    },
    onError,
  );
}

export function listenToInvites(
  uid: string,
  handler: InviteListener,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  const invitesRef = collection(db, "users", uid, "gameNightInvites");

  return onSnapshot(
    invitesRef,
    (snapshot) => {
      const invites = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data() as GameNightInviteDoc;
        return {
          id: docSnapshot.id,
          ...data,
        };
      });
      handler(invites);
    },
    onError,
  );
}

export async function createGameNightDoc(
  ownerId: string,
  ownerName: string,
  ownerEmail: string | null,
  ownerPhotoURL: string | null,
  night: Omit<GameNight, "id" | "ownerId" | "createdAt" | "updatedAt" | "status">,
) {
  const nightRef = doc(collection(db, "gameNights"));

  const invitedFriendIds = night.invitedFriends.map((friend) => friend.id);
  const timestamp = serverTimestamp();

  const payload: FirestoreGameNight = {
    ownerId,
    ownerName,
    ownerEmail: ownerEmail ?? undefined,
    ownerPhotoURL,
    title: night.title,
    date: night.date,
    time: night.time,
    location: night.location,
    invitedFriends: night.invitedFriends,
    invitedFriendIds,
    acceptedFriendIds: [ownerId],
    selectedGames: night.selectedGames,
    status: invitedFriendIds.length > 0 ? "pending" : "accepted",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await setDoc(nightRef, payload);

  await Promise.all(
    invitedFriendIds.map((friendId) =>
      setDoc(doc(db, "users", friendId, "gameNightInvites", nightRef.id), {
        nightId: nightRef.id,
        ownerId,
        ownerName,
        ownerPhotoURL,
        title: night.title,
        date: night.date,
        time: night.time,
        location: night.location,
        status: "pending",
        createdAt: timestamp,
        updatedAt: timestamp,
        inviterId: ownerId,
      }),
    ),
  );
}

export async function acceptInvitation(uid: string, nightId: string) {
  const nightRef = doc(db, "gameNights", nightId);
  const inviteRef = doc(db, "users", uid, "gameNightInvites", nightId);

  await runTransaction(db, async (transaction) => {
    const nightSnapshot = await transaction.get(nightRef);
    if (!nightSnapshot.exists()) {
      throw new Error("This game night no longer exists.");
    }

    const data = nightSnapshot.data() as FirestoreGameNight;
    const accepted = new Set(data.acceptedFriendIds ?? []);
    accepted.add(uid);

    const invited = new Set(data.invitedFriendIds ?? []);
    invited.delete(uid);

    transaction.update(nightRef, {
      acceptedFriendIds: Array.from(accepted),
      invitedFriendIds: Array.from(invited),
      updatedAt: serverTimestamp(),
    });
  });

  await updateDoc(inviteRef, {
    status: "accepted",
    updatedAt: serverTimestamp(),
  });
}

export async function declineInvitation(uid: string, nightId: string) {
  const nightRef = doc(db, "gameNights", nightId);
  const inviteRef = doc(db, "users", uid, "gameNightInvites", nightId);

  await runTransaction(db, async (transaction) => {
    const nightSnapshot = await transaction.get(nightRef);
    if (!nightSnapshot.exists()) {
      return;
    }

    const data = nightSnapshot.data() as FirestoreGameNight;
    const invited = new Set(data.invitedFriendIds ?? []);
    invited.delete(uid);

    transaction.update(nightRef, {
      invitedFriendIds: Array.from(invited),
      updatedAt: serverTimestamp(),
    });
  });

  await updateDoc(inviteRef, {
    status: "declined",
    updatedAt: serverTimestamp(),
  });
}

export async function deleteGameNight(ownerId: string, nightId: string) {
  const nightRef = doc(db, "gameNights", nightId);
  const snapshot = await getDoc(nightRef);

  if (!snapshot.exists()) return;

  const data = snapshot.data() as FirestoreGameNight;
  if (data.ownerId !== ownerId) {
    throw new Error("Only the owner can delete this game night.");
  }

  await Promise.all(
    (data.invitedFriendIds ?? []).map((friendId) =>
      deleteDoc(doc(db, "users", friendId, "gameNightInvites", nightId)),
    ),
  );

  await deleteDoc(nightRef);
}

function transformNightDoc(id: string, data: FirestoreGameNight): GameNight {
  return {
    id,
    ownerId: data.ownerId,
    ownerName: data.ownerName,
    ownerPhotoURL: data.ownerPhotoURL ?? null,
    title: data.title,
    date: data.date,
    time: data.time,
    location: data.location,
    members: [], // hydrated in hook
    invitedFriends: data.invitedFriends ?? [],
    invitedFriendIds: data.invitedFriendIds ?? [],
    acceptedFriendIds: data.acceptedFriendIds ?? [],
    selectedGames: data.selectedGames ?? [],
    status: data.status ?? "pending",
    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : undefined,
    updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : undefined,
  };
}
