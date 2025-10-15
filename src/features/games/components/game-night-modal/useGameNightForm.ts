import { useMemo, useState } from 'react';

import { formatDateDisplay, formatTimeDisplay } from '@/shared/utils/date';

export function useGameNightForm() {
  const [title, setTitle] = useState('');
  const [dateValue, setDateValue] = useState<Date | null>(null);
  const [timeValue, setTimeValue] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [invitedFriends, setInvitedFriends] = useState<string[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const toggleGame = (id: string) => {
    setSelectedGames((prev) =>
      prev.includes(id) ? prev.filter((gameId) => gameId !== id) : [...prev, id],
    );
  };

  const toggleFriend = (id: string) => {
    setInvitedFriends((prev) =>
      prev.includes(id) ? prev.filter((friendId) => friendId !== id) : [...prev, id],
    );
  };

  const formattedDate = useMemo(
    () => (dateValue ? formatDateDisplay(dateValue) : ''),
    [dateValue],
  );

  const formattedTime = useMemo(
    () => (timeValue ? formatTimeDisplay(timeValue) : ''),
    [timeValue],
  );

  const resetForm = () => {
    setTitle('');
    setDateValue(null);
    setTimeValue(null);
    setLocation('');
    setSelectedGames([]);
    setInvitedFriends([]);
  };

  return {
    title,
    setTitle,
    dateValue,
    setDateValue,
    timeValue,
    setTimeValue,
    formattedDate,
    formattedTime,
    location,
    setLocation,
    selectedGames,
    toggleGame,
    invitedFriends,
    toggleFriend,
    showErrorDialog,
    setShowErrorDialog,
    resetForm,
  };
}
