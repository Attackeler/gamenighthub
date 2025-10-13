import { useMemo, useState } from 'react';

import { formatDateDisplay, formatTimeDisplay } from '@/shared/utils/date';

export function useGameNightForm() {
  const [title, setTitle] = useState('');
  const [dateValue, setDateValue] = useState<Date | null>(null);
  const [timeValue, setTimeValue] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [selectedGames, setSelectedGames] = useState<number[]>([]);
  const [invitedFriends, setInvitedFriends] = useState<number[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const toggleGame = (id: number) => {
    setSelectedGames((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const toggleFriend = (id: number) => {
    setInvitedFriends((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
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
    title, setTitle,
    dateValue, setDateValue,
    timeValue, setTimeValue,
    formattedDate,
    formattedTime,
    location, setLocation,
    selectedGames, toggleGame,
    invitedFriends, toggleFriend,
    showErrorDialog, setShowErrorDialog,
    resetForm,
  };
}
