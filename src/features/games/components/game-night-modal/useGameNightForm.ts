import { useState } from 'react';

export function useGameNightForm() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
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

  const resetForm = () => {
    setTitle('');
    setDate('');
    setTime('');
    setLocation('');
    setSelectedGames([]);
    setInvitedFriends([]);
  };

  return {
    title, setTitle,
    date, setDate,
    time, setTime,
    location, setLocation,
    selectedGames, toggleGame,
    invitedFriends, toggleFriend,
    showErrorDialog, setShowErrorDialog,
    resetForm,
  };
}
