import { useCallback, useEffect, useMemo, useState } from "react";

import useAuth from "@/features/auth/hooks/useAuth";
import { useUserProfile } from "@/features/profile/context/UserProfileContext";
import type { CreateGameNightFormValues } from "@/features/games/components/game-night-modal/CreateGameNightModal";
import type { GameNight } from "../screens/home/HomeScreen.types";
import {
  acceptInvitation,
  createGameNightDoc,
  declineInvitation,
  deleteGameNight,
  listenToAcceptedGameNights,
  listenToInvites,
  listenToOwnedGameNights,
  type GameNightInvite,
} from "../services/gameNightService";

type UseGameNightsResult = {
  gameNights: GameNight[];
  invitations: GameNightInvite[];
  loading: boolean;
  createNight: (values: CreateGameNightFormValues) => Promise<void>;
  acceptInvite: (nightId: string) => Promise<void>;
  declineInvite: (nightId: string) => Promise<void>;
  removeNight: (nightId: string) => Promise<void>;
};

export function useGameNights(): UseGameNightsResult {
  const { user } = useAuth();
  const { profile, friends } = useUserProfile();

  const [ownedNights, setOwnedNights] = useState<GameNight[]>([]);
  const [acceptedNights, setAcceptedNights] = useState<GameNight[]>([]);
  const [invitations, setInvitations] = useState<GameNightInvite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOwnedNights([]);
    setAcceptedNights([]);
    setInvitations([]);

    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let isActive = true;
    let ownedReady = false;
    let acceptedReady = false;
    let invitesReady = false;

    const checkReady = () => {
      if (!isActive) return;
      if (ownedReady && acceptedReady && invitesReady) {
        setLoading(false);
      }
    };

    const ownedUnsubscribe = listenToOwnedGameNights(
      user.uid,
      (nights) => {
        if (!isActive) return;
        setOwnedNights(nights);
        if (!ownedReady) {
          ownedReady = true;
          checkReady();
        }
      },
      (error) => {
        console.warn("Owned nights listener error", error);
        if (!isActive) return;
        ownedReady = true;
        checkReady();
      },
    );

    const acceptedUnsubscribe = listenToAcceptedGameNights(
      user.uid,
      (nights) => {
        if (!isActive) return;
        setAcceptedNights(nights);
        if (!acceptedReady) {
          acceptedReady = true;
          checkReady();
        }
      },
      (error) => {
        console.warn("Accepted nights listener error", error);
        if (!isActive) return;
        acceptedReady = true;
        checkReady();
      },
    );

    const invitesUnsubscribe = listenToInvites(
      user.uid,
      (pendingInvites) => {
        if (!isActive) return;
        setInvitations(pendingInvites);
        if (!invitesReady) {
          invitesReady = true;
          checkReady();
        }
      },
      (error) => {
        console.warn("Invites listener error", error);
        if (!isActive) return;
        invitesReady = true;
        checkReady();
      },
    );

    return () => {
      isActive = false;
      ownedUnsubscribe();
      acceptedUnsubscribe();
      invitesUnsubscribe();
    };
  }, [user?.uid]);

  const gameNights = useMemo(() => {
    const combined = new Map<string, GameNight>();

    [...ownedNights, ...acceptedNights].forEach((night) => {
      combined.set(night.id, night);
    });

    const friendLookup = new Map(friends.map((friend) => [friend.uid, friend]));

    return Array.from(combined.values()).map((night) => {
      const accepted = new Set(night.acceptedFriendIds);

      const members = Array.from(accepted).map((participantId) => {
        if (participantId === night.ownerId) {
          const ownerAvatar =
            profile?.photoURL ?? user?.photoURL ?? `https://i.pravatar.cc/80?u=${participantId}`;
          return ownerAvatar;
        }
        const friend = friendLookup.get(participantId);
        if (friend?.photoURL) return friend.photoURL;
        return `https://i.pravatar.cc/80?u=${participantId}`;
      });

      return {
        ...night,
        members,
      };
    });
  }, [acceptedNights, friends, ownedNights, profile?.photoURL, user?.photoURL]);

  const createNight = useCallback(
    async (values: CreateGameNightFormValues) => {
      if (!user?.uid) {
        throw new Error("You need to be signed in to create a game night.");
      }

      const ownerName =
        profile?.displayName ||
        profile?.email ||
        user.email ||
        user.displayName ||
        "Game Night Host";

      await createGameNightDoc(
        user.uid,
        ownerName,
        user.email ?? null,
        profile?.photoURL ?? user.photoURL ?? null,
        {
          id: "",
          ownerId: user.uid,
          title: values.title,
          date: values.date,
          time: values.time,
          location: values.location,
          members: [],
          invitedFriends: values.invitedFriends,
          invitedFriendIds: values.invitedFriends.map((friend) => friend.id),
          acceptedFriendIds: [],
          selectedGames: values.selectedGames,
          status: "pending",
        },
      );
    },
    [profile?.displayName, profile?.photoURL, profile?.email, user?.email, user?.photoURL, user?.uid],
  );

  const acceptInvite = useCallback(
    async (nightId: string) => {
      if (!user?.uid) {
        throw new Error("You need to be signed in to accept an invitation.");
      }
      await acceptInvitation(user.uid, nightId);
    },
    [user?.uid],
  );

  const declineInvite = useCallback(
    async (nightId: string) => {
      if (!user?.uid) {
        throw new Error("You need to be signed in to decline an invitation.");
      }
      await declineInvitation(user.uid, nightId);
    },
    [user?.uid],
  );

  const removeNight = useCallback(
    async (nightId: string) => {
      if (!user?.uid) {
        throw new Error("You need to be signed in to delete a game night.");
      }
      await deleteGameNight(user.uid, nightId);
    },
    [user?.uid],
  );

  const pendingInvitations = useMemo(
    () => invitations.filter((invite) => invite.status === "pending"),
    [invitations],
  );

  return {
    gameNights,
    invitations: pendingInvitations,
    loading,
    createNight,
    acceptInvite,
    declineInvite,
    removeNight,
  };
}

