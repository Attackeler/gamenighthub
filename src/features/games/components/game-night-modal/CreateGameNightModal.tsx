import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Chip,
  Dialog,
  IconButton,
  Modal,
  Portal,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { View, Platform, ScrollView, StyleSheet } from "react-native";
import { AdvancedCheckbox } from "react-native-advanced-checkbox";
import {
  formatMonthYear,
  padTwoDigits,
  startOfDay,
  isSameDay,
} from "@/shared/utils/date";
import { useGameNightForm } from "./useGameNightForm";
import { useGames } from "@/features/games/hooks/useGames";
import { games as fallbackGames, type FriendOption, type GameOption } from "./mockData";
import { useUserProfile } from "@/features/profile/context/UserProfileContext";

export type CreateGameNightFormValues = {
  title: string;
  date: string;
  time: string;
  location: string;
  selectedGames: GameOption[];
  invitedFriends: FriendOption[];
};

export default function CreateGameNightModal({
  visible,
  onDismiss,
  onCreate,
}: {
  visible: boolean;
  onDismiss: () => void;
  onCreate: (values: CreateGameNightFormValues) => void;
}) {
  const theme = useTheme();
  const form = useGameNightForm();
  const allGames = useGames();
  const { friends: userFriends, loadingFriends } = useUserProfile();

  const friendOptions = useMemo<FriendOption[]>(
    () =>
      userFriends.map((friend) => ({
        id: friend.uid,
        name: friend.displayName ?? friend.email ?? "Player",
        email: friend.email ?? "",
        friendCode: friend.friendCode ?? "",
        photoURL: friend.photoURL ?? null,
      })),
    [userFriends],
  );

  const gameOptions = useMemo<GameOption[]>(() => {
    const source = allGames.length > 0 ? allGames : fallbackGames;
    if (!source?.length) {
      return [];
    }

    return source.map((game) => {
      const name = game.name?.trim() || "Untitled Game";
      const duration = game.duration?.trim() || "Duration unavailable";

      let playersLabel = game.players?.trim();
      if (!playersLabel) {
        const minRaw = (game as any).minPlayers;
        const maxRaw = (game as any).maxPlayers;
        const min =
          typeof minRaw === "number" && Number.isFinite(minRaw) ? minRaw : null;
        const max =
          typeof maxRaw === "number" && Number.isFinite(maxRaw) ? maxRaw : null;

        if (min !== null && max !== null) {
          playersLabel = `${min}-${max} players`;
        } else if (min !== null) {
          playersLabel = `${min}+ players`;
        } else if (max !== null) {
          playersLabel = `Up to ${max} players`;
        } else {
          playersLabel = "Players info unavailable";
        }
      }

      return {
        id: String(game.id),
        name,
        duration,
        players: playersLabel,
      };
    });
  }, [allGames]);

  const [gameSearch, setGameSearch] = useState("");
  const [friendSearch, setFriendSearch] = useState("");
  const [selectedGamesListVisible, setSelectedGamesListVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filteredGames = useMemo(() => {
    const query = gameSearch.trim().toLowerCase();
    if (!query) return [];

    return gameOptions
      .filter((game) => game.name.toLowerCase().includes(query))
      .slice(0, 20);
  }, [gameOptions, gameSearch]);

  const filteredFriends = useMemo(() => {
    const query = friendSearch.trim().toLowerCase();
    if (!query) return friendOptions;
    return friendOptions.filter((friend) => {
      const haystack = `${friend.name} ${friend.email ?? ""} ${friend.friendCode ?? ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [friendOptions, friendSearch]);

  const selectedGameDetails = useMemo(() => {
    if (form.selectedGames.length === 0) {
      return [] as GameOption[];
    }
    const byId = new Map(gameOptions.map((game) => [game.id, game]));
    return form.selectedGames
      .map((id) => byId.get(id))
      .filter((game): game is GameOption => Boolean(game));
  }, [form.selectedGames, gameOptions]);
  const hasGameQuery = gameSearch.trim().length > 0;

  useEffect(() => {
    if (!visible) {
      setGameSearch("");
      setFriendSearch("");
      setSelectedGamesListVisible(false);
    }
  }, [visible]);
  useEffect(() => {
    if (selectedGamesListVisible && selectedGameDetails.length <= 2) {
      setSelectedGamesListVisible(false);
    }
  }, [selectedGamesListVisible, selectedGameDetails]);


  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);

  const ensureFutureDate = (candidate?: Date | null) => {
    const now = new Date();
    const todayStart = startOfDay(now);
    if (candidate && candidate.getTime() >= todayStart.getTime()) {
      return new Date(candidate);
    }
    return now;
  };

  const ensureValidTime = (dateForTime: Date, candidate?: Date | null) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (
      candidate &&
      (!isSameDay(dateForTime, now) ||
        candidate.getHours() > currentHour ||
        (candidate.getHours() === currentHour &&
          candidate.getMinutes() >= currentMinute))
    ) {
      return {
        hour: candidate.getHours(),
        minute: candidate.getMinutes(),
      };
    }

    return { hour: currentHour, minute: currentMinute };
  };

  const initialDate = ensureFutureDate(form.dateValue);
  const initialTime = ensureValidTime(initialDate, form.timeValue);

  const [calendarMonth, setCalendarMonth] = useState(startOfMonth(initialDate));
  const [draftDate, setDraftDate] = useState<Date>(initialDate);
  const [draftHour, setDraftHour] = useState(initialTime.hour);
  const [draftMinute, setDraftMinute] = useState(initialTime.minute);

  const openDatePicker = () => {
    const safeDate = ensureFutureDate(form.dateValue);
    setDraftDate(new Date(safeDate));
    setCalendarMonth(startOfMonth(safeDate));
    setDatePickerVisible(true);
  };

  const openTimePicker = () => {
    const safeDate = ensureFutureDate(form.dateValue);
    const validTime = ensureValidTime(safeDate, form.timeValue);
    setDraftHour(validTime.hour);
    setDraftMinute(validTime.minute);
    setTimePickerVisible(true);
  };

  const todayStart = startOfDay(new Date());
  const todayMonthStart = startOfMonth(new Date());
  const prevMonthDate = addMonths(calendarMonth, -1);
  const canGoPrev = prevMonthDate.getTime() >= todayMonthStart.getTime();

  const currentDateForTime = ensureFutureDate(form.dateValue);
  const nowForTime = new Date();
  const isSelectedDateToday = isSameDay(currentDateForTime, nowForTime);
  const currentHour = nowForTime.getHours();
  const currentMinute = nowForTime.getMinutes();

  const handleSubmit = async () => {
    const {
      title,
      dateValue,
      timeValue,
      formattedDate,
      formattedTime,
      location,
      invitedFriends: invitedFriendIds,
    } = form;

    if (!title || !dateValue || !timeValue || !location) {
      form.setShowErrorDialog(true);
      return;
    }

    const now = new Date();
    if (startOfDay(dateValue).getTime() < startOfDay(now).getTime()) {
      form.setShowErrorDialog(true);
      return;
    }
    if (
      isSameDay(dateValue, now) &&
      (timeValue.getHours() < now.getHours() ||
        (timeValue.getHours() === now.getHours() &&
          timeValue.getMinutes() < now.getMinutes()))
    ) {
      form.setShowErrorDialog(true);
      return;
    }

    const invitedFriendDetails = friendOptions.filter((friend) =>
      invitedFriendIds.includes(friend.id)
    );

    try {
      setSubmitting(true);
      await onCreate({
        title,
        date: formattedDate,
        time: formattedTime,
        location,
        selectedGames: selectedGameDetails,
        invitedFriends: invitedFriendDetails,
      });
      form.resetForm?.();
      setGameSearch("");
      setFriendSearch("");
      setSelectedGamesListVisible(false);
      onDismiss();
    } catch (error) {
      console.warn("Failed to submit game night", error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = () => {
    const inlineSelectedGames = selectedGameDetails.slice(0, 2);
    const extraSelectedGamesCount = Math.max(
      selectedGameDetails.length - inlineSelectedGames.length,
      0,
    );

    return (
      <View style={{ paddingHorizontal: 24, paddingBottom: 16, gap: 12 }}>
      <Text
        variant="titleMedium"
        style={{ fontWeight: "bold", marginBottom: 16 }}
      >
        Create Game Night
      </Text>

      <TextInput
        label="Game Night Title *"
        value={form.title}
        onChangeText={form.setTitle}
        mode="outlined"
        style={{ marginBottom: 12 }}
      />

      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <TextInput
          label="Date *"
          value={form.formattedDate}
          mode="outlined"
          style={{ flex: 1 }}
          editable={false}
          placeholder="Select date"
          onPressIn={openDatePicker}
          right={
            <TextInput.Icon
              icon="calendar"
              onPress={openDatePicker}
            />
          }
        />
        <TextInput
          label="Time *"
          value={form.formattedTime}
          mode="outlined"
          style={{ flex: 1 }}
          editable={false}
          placeholder="Select time"
          onPressIn={openTimePicker}
          right={<TextInput.Icon icon="clock" onPress={openTimePicker} />}
        />
      </View>

      <TextInput
        label="Location *"
        value={form.location}
        onChangeText={form.setLocation}
        mode="outlined"
        style={{ marginBottom: 12 }}
      />

      <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Select Games</Text>
      {gameOptions.length > 0 ? (
        <>
          <TextInput
            mode="outlined"
            value={gameSearch}
            onChangeText={setGameSearch}
            placeholder="Search games"
            left={<TextInput.Icon icon="magnify" />}
            style={{ marginBottom: 12 }}
          />
          {selectedGameDetails.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: hasGameQuery ? 8 : 16,
                alignItems: "center",
                minHeight: 32,
              }}
            >
              {inlineSelectedGames.map((game) => (
                <Chip
                  key={`selected-${game.id}`}
                  mode="outlined"
                  selected
                  onClose={() => form.toggleGame(game.id)}
                  style={{ borderColor: theme.colors.primary, minHeight: 32, justifyContent: "center" }}
                  textStyle={{ color: theme.colors.onSurface }}
                >
                  {game.name}
                </Chip>
              ))}
              {extraSelectedGamesCount > 0 && (
                <Chip
                  mode="outlined"
                  icon="format-list-bulleted"
                  onPress={() => setSelectedGamesListVisible(true)}
                  style={{ borderColor: theme.colors.primary, minHeight: 32, justifyContent: "center" }}
                  textStyle={{ color: theme.colors.onSurface }}
                >
                  +{extraSelectedGamesCount} more
                </Chip>
              )}
            </View>
          )}
          {hasGameQuery ? (
            filteredGames.length > 0 ? (
              <View
                style={{
                  maxHeight: 220,
                  borderWidth: 1,
                  borderColor: theme.colors.outlineVariant ?? theme.colors.outline,
                  borderRadius: 16,
                  paddingVertical: 4,
                  paddingHorizontal: 6,
                  marginBottom: 4,
                }}
              >
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 4 }}
                >
                  {filteredGames.map((game) => {
                    const isSelected = form.selectedGames.includes(game.id);
                    return (
                      <TouchableRipple
                        key={game.id}
                        borderless={false}
                        onPress={() => form.toggleGame(game.id)}
                        style={{ borderRadius: 12, marginBottom: 4 }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: 6,
                            paddingHorizontal: 6,
                            borderRadius: 12,
                            backgroundColor: isSelected
                              ? theme.colors.primaryContainer ?? theme.colors.primary
                              : "transparent",
                            userSelect: "none",
                            minHeight: 32,
                          }}
                        >
                          <AdvancedCheckbox
                            value={isSelected}
                            onValueChange={() => form.toggleGame(game.id)}
                            uncheckedColor={theme.colors.outline}
                            checkedColor={theme.colors.primary}
                          />
                          <View style={{ marginLeft: 10, flex: 1 }}>
                            <Text
                              style={{
                                fontWeight: "600",
                                color: isSelected
                                  ? theme.colors.onPrimary ?? theme.colors.onSurface
                                  : theme.colors.onSurface,
                              }}
                              numberOfLines={1}
                            >
                              {game.name}
                            </Text>
                            <Text
                              style={{
                                color: isSelected
                                  ? theme.colors.onPrimary ?? theme.colors.onSurface
                                  : theme.colors.onSurfaceVariant,
                                fontSize: 12,
                                marginTop: 2,
                              }}
                              numberOfLines={1}
                            >
                              {`${game.duration} • ${game.players}`}
                            </Text>
                          </View>
                        </View>
                      </TouchableRipple>
                    );
                  })}
                </ScrollView>
              </View>
            ) : (
              <Text style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
                No games match your search.
              </Text>
            )
          ) : (
            <Text style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
              Start typing to search your games.
            </Text>
          )}
        </>
      ) : (
        <Text style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
          No games available yet.
        </Text>
      )}

      {gameOptions.length > 0 && !hasGameQuery && selectedGameDetails.length === 0 && (
        <Text style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
          Select games by searching and ticking them from the results.
        </Text>
      )}

      <Text style={{ fontWeight: "bold", marginTop: 20, marginBottom: 10 }}>
        Invite Friends
        </Text>
        {friendOptions.length > 0 && (
          <TextInput
            mode="outlined"
            value={friendSearch}
            onChangeText={setFriendSearch}
            placeholder="Search by name, email, or ID"
            left={<TextInput.Icon icon="magnify" />}
            style={{ marginBottom: 12 }}
          />
        )}
        {loadingFriends ? (
          <View style={{ paddingVertical: 12, alignItems: "center" }}>
            <ActivityIndicator />
          </View>
        ) : friendOptions.length === 0 ? (
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            You haven't added any friends yet. Share your friend ID from the profile tab to invite
            players.
          </Text>
        ) : filteredFriends.length === 0 ? (
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            No friends match your search.
          </Text>
        ) : (
          filteredFriends.map((friend) => (
            <View
              key={friend.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
                userSelect: "none",
              }}
            >
              <AdvancedCheckbox
                value={form.invitedFriends.includes(friend.id)}
                onValueChange={() => form.toggleFriend(friend.id)}
                uncheckedColor={theme.colors.outline}
                checkedColor={theme.colors.primary}
              />
              <Text style={{ marginLeft: 8 }}>
                {friend.friendCode
                  ? `${friend.name} (${friend.email}) - ${friend.friendCode}`
                  : `${friend.name} (${friend.email})`}
              </Text>
            </View>
          ))
        )}

      <View
        style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 20 }}
      >
        <Button onPress={onDismiss}>Cancel</Button>
        <Button mode="contained" style={{ marginLeft: 12 }} onPress={handleSubmit} loading={submitting} disabled={submitting}>
          Create Game Night
        </Button>
      </View>
    </View>
    );
  };

  return (
    <Portal>
      {Platform.OS === "web" ? (
        <Dialog
          visible={visible}
          onDismiss={onDismiss}
          style={{
            maxWidth: 700,
            alignSelf: "center",
            backgroundColor: theme.colors.background,
            borderWidth: 1,
            borderColor: theme.colors.primary,
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <Dialog.Content
            style={{
              backgroundColor: theme.colors.background,
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
            }}
          >
            {renderContent()}
          </Dialog.Content>
        </Dialog>
      ) : (
        <Modal
          visible={visible}
          onDismiss={onDismiss}
          contentContainerStyle={{
            marginHorizontal: 16,
            borderRadius: 20,
            backgroundColor: theme.colors.background,
            paddingVertical: 16,
            borderWidth: 1,
            borderColor: theme.colors.primary,
          }}
        >
          {renderContent()}
        </Modal>
      )}

      <Dialog
        visible={selectedGamesListVisible}
        onDismiss={() => setSelectedGamesListVisible(false)}
        style={{
          maxWidth: 420,
          alignSelf: "center",
          backgroundColor: theme.colors.background,
          borderWidth: 1,
          borderColor: theme.colors.primary,
          borderRadius: 20,
        }}
      >
        <Dialog.Title>Selected Games</Dialog.Title>
        <Dialog.Content style={{ maxHeight: 320 }}>
          {selectedGameDetails.length ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedGameDetails.map((game) => (
                <View key={`selected-summary-${game.id}`} style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: "600", color: theme.colors.onSurface }}>
                    {game.name}
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      marginTop: 2,
                      fontSize: 12,
                    }}
                  >
                    {`${game.duration} • ${game.players}`}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              No games selected yet.
            </Text>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setSelectedGamesListVisible(false)}>Close</Button>
        </Dialog.Actions>
      </Dialog>

      <Dialog
        visible={datePickerVisible}
        onDismiss={() => setDatePickerVisible(false)}
        style={[
          styles.pickerDialog,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.primary,
          },
        ]}
      >
        <Dialog.Title>Select Date</Dialog.Title>
        <Dialog.Content
          style={[
            styles.pickerDialogContent,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View style={styles.calendarHeader}>
            <IconButton
              icon="chevron-left"
              disabled={!canGoPrev}
              onPress={() => {
                if (canGoPrev) {
                  setCalendarMonth(prevMonthDate);
                }
              }}
            />
            <Text style={styles.calendarHeaderText}>{formatMonthYear(calendarMonth)}</Text>
            <IconButton
              icon="chevron-right"
              onPress={() => setCalendarMonth(addMonths(calendarMonth, 1))}
            />
          </View>
          <View style={styles.calendarWeekRow}>
            {WEEKDAY_LABELS.map((label) => (
              <Text key={label} style={styles.calendarWeekLabel}>
                {label}
              </Text>
            ))}
          </View>
          {getMonthMatrix(calendarMonth).map((week, index) => (
            <View key={index} style={styles.calendarWeekRow}>
              {week.map((date, idx) => {
                if (!date) {
                  return <View key={idx} style={styles.calendarDayPlaceholder} />;
                }

                const isSelected = draftDate ? isSameDay(date, draftDate) : false;
                const isDisabled =
                  startOfDay(date).getTime() < todayStart.getTime();

                return (
                  <TouchableRipple
                    key={idx}
                    disabled={isDisabled}
                    style={[
                      styles.calendarDay,
                      isSelected && { backgroundColor: theme.colors.primary },
                      isDisabled && styles.calendarDayDisabled,
                    ]}
                    onPress={() => {
                      if (!isDisabled) {
                        setDraftDate(new Date(date));
                      }
                    }}
                    borderless
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        isSelected && {
                          color: theme.colors.onPrimary ?? "#ffffff",
                          fontWeight: "bold",
                        },
                        isDisabled && styles.calendarDayTextDisabled,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </TouchableRipple>
                );
              })}
            </View>
          ))}
        </Dialog.Content>
        <Dialog.Actions
          style={[
            styles.pickerDialogActions,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Button onPress={() => setDatePickerVisible(false)}>Cancel</Button>
          <Button
            onPress={() => {
              const safeDate = ensureFutureDate(draftDate);
              form.setDateValue(new Date(safeDate));

              if (form.timeValue) {
                const adjustedTime = ensureValidTime(safeDate, form.timeValue);
                const nextTime = new Date();
                nextTime.setHours(adjustedTime.hour);
                nextTime.setMinutes(adjustedTime.minute);
                nextTime.setSeconds(0);
                nextTime.setMilliseconds(0);
                form.setTimeValue(nextTime);
                setDraftHour(adjustedTime.hour);
                setDraftMinute(adjustedTime.minute);
              } else if (isSameDay(safeDate, new Date())) {
                const now = new Date();
                const adjusted = ensureValidTime(safeDate, now);
                setDraftHour(adjusted.hour);
                setDraftMinute(adjusted.minute);
              }

              setDatePickerVisible(false);
            }}
          >
            Confirm
          </Button>
        </Dialog.Actions>
      </Dialog>

      <Dialog
        visible={timePickerVisible}
        onDismiss={() => setTimePickerVisible(false)}
        style={[
          styles.pickerDialog,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.primary,
          },
        ]}
      >
        <Dialog.Title>Select Time</Dialog.Title>
        <Dialog.Content
          style={[
            styles.pickerDialogContent,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View style={styles.timePickerContainer}>
            <View style={styles.timePickerColumn}>
              <Text style={styles.timePickerLabel}>Hour</Text>
              <ScrollView style={styles.timePickerList}>
                {HOURS.map((hour) => {
                  const isSelected = hour === draftHour;
                  const isHourDisabled =
                    isSelectedDateToday && hour < currentHour;

                  return (
                    <TouchableRipple
                      key={hour}
                      disabled={isHourDisabled}
                      style={[
                        styles.timePickerOption,
                        isSelected && { backgroundColor: theme.colors.primary },
                        isHourDisabled && styles.timePickerOptionDisabled,
                      ]}
                      onPress={() => {
                        if (isHourDisabled) return;
                        setDraftHour(hour);
                        if (
                          isSelectedDateToday &&
                          hour === currentHour &&
                          draftMinute < currentMinute
                        ) {
                          setDraftMinute(currentMinute);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.timePickerOptionText,
                          isSelected && {
                            color: theme.colors.onPrimary ?? "#ffffff",
                            fontWeight: "bold",
                          },
                          isHourDisabled && styles.timePickerOptionTextDisabled,
                        ]}
                      >
                        {padTwoDigits(hour)}
                      </Text>
                    </TouchableRipple>
                  );
                })}
              </ScrollView>
            </View>
            <View style={styles.timePickerColumn}>
              <Text style={styles.timePickerLabel}>Minute</Text>
              <ScrollView style={styles.timePickerList}>
                {MINUTES.map((minute) => {
                  const isSelected = minute === draftMinute;
                  const isMinuteDisabled =
                    isSelectedDateToday &&
                    draftHour === currentHour &&
                    minute < currentMinute;

                  return (
                    <TouchableRipple
                      key={minute}
                      disabled={isMinuteDisabled}
                      style={[
                        styles.timePickerOption,
                        isSelected && { backgroundColor: theme.colors.primary },
                        isMinuteDisabled && styles.timePickerOptionDisabled,
                      ]}
                      onPress={() => {
                        if (!isMinuteDisabled) {
                          setDraftMinute(minute);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.timePickerOptionText,
                          isSelected && {
                            color: theme.colors.onPrimary ?? "#ffffff",
                            fontWeight: "bold",
                          },
                          isMinuteDisabled &&
                            styles.timePickerOptionTextDisabled,
                        ]}
                      >
                        {padTwoDigits(minute)}
                      </Text>
                    </TouchableRipple>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Dialog.Content>
        <Dialog.Actions
          style={[
            styles.pickerDialogActions,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Button onPress={() => setTimePickerVisible(false)}>Cancel</Button>
          <Button
            onPress={() => {
              const targetDate = ensureFutureDate(form.dateValue);
              const candidateTime = new Date();
              candidateTime.setHours(draftHour);
              candidateTime.setMinutes(draftMinute);
              candidateTime.setSeconds(0);
              candidateTime.setMilliseconds(0);

              const valid = ensureValidTime(targetDate, candidateTime);
              const nextTime = new Date();
              nextTime.setHours(valid.hour);
              nextTime.setMinutes(valid.minute);
              nextTime.setSeconds(0);
              nextTime.setMilliseconds(0);

              setDraftHour(valid.hour);
              setDraftMinute(valid.minute);
              form.setTimeValue(nextTime);
              setTimePickerVisible(false);
            }}
          >
            Confirm
          </Button>
        </Dialog.Actions>
      </Dialog>

      <Dialog
        visible={form.showErrorDialog}
        onDismiss={() => form.setShowErrorDialog(false)}
      >
        <Dialog.Title>Error</Dialog.Title>
        <Dialog.Content>
          <Text>Please fill all information required.</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => form.setShowErrorDialog(false)}>OK</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);

const startOfMonth = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), 1);

const addMonths = (value: Date, amount: number) => {
  const next = new Date(value);
  return new Date(next.getFullYear(), next.getMonth() + amount, 1);
};

const getMonthMatrix = (value: Date) => {
  const matrix: (Date | null)[][] = [];
  const year = value.getFullYear();
  const monthIndex = value.getMonth();
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const firstWeekday = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  let currentDay = 1 - firstWeekday;

  while (currentDay <= daysInMonth) {
    const week: (Date | null)[] = [];

    for (let i = 0; i < 7; i += 1) {
      if (currentDay < 1 || currentDay > daysInMonth) {
        week.push(null);
      } else {
        week.push(new Date(year, monthIndex, currentDay));
      }
      currentDay += 1;
    }

    matrix.push(week);
  }

  return matrix;
};

const styles = StyleSheet.create({
  pickerDialog: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: "hidden",
    maxWidth: 480,
    width: "90%",
    alignSelf: "center",
  },
  pickerDialogContent: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 0,
  },
  pickerDialogActions: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: "flex-end",
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  calendarHeaderText: {
    fontWeight: "bold",
  },
  calendarWeekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  calendarWeekLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  calendarDayPlaceholder: {
    flex: 1,
    height: 36,
  },
  calendarDay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 36,
    borderRadius: 18,
    marginVertical: 2,
  },
  calendarDayDisabled: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 14,
  },
  calendarDayTextDisabled: {
    color: "#8c8c8c",
  },
  timePickerContainer: {
    flexDirection: "row",
    gap: 16,
  },
  timePickerColumn: {
    flex: 1,
  },
  timePickerLabel: {
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 8,
  },
  timePickerList: {
    maxHeight: 180,
  },
  timePickerOption: {
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  timePickerOptionDisabled: {
    opacity: 0.3,
  },
  timePickerOptionText: {
    fontSize: 16,
  },
  timePickerOptionTextDisabled: {
    color: "#8c8c8c",
  },
});














