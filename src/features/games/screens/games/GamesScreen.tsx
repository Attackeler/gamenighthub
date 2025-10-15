import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, TouchableOpacity, View, useWindowDimensions, ScrollView } from "react-native";
import { Button, Chip, Divider, Icon, IconButton, Menu, Modal, Portal, Searchbar, SegmentedButtons, Text, useTheme } from "react-native-paper";

import GameCard from "@/features/games/components/game-card/GameCard";
import { useGames } from "@/features/games/hooks/useGames";
import type { Game } from "@/features/games/types";
import { AppTheme } from "@/app/theme/types";

import { gamesScreenStyles } from "./GamesScreen.styles";

const PAGE_SIZE = 10;
const PAGE_WINDOW = 5;
const DEFAULT_CATEGORY = "All";
type SortOption = "popularity" | "name" | "difficulty" | "category";
type DifficultyFilter = (typeof DIFFICULTY_FILTERS)[number];
const DIFFICULTY_FILTERS = ["All", "Easy", "Medium", "Hard"] as const;
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popularity", label: "Popularity" },
  { value: "name", label: "Name" },
  { value: "difficulty", label: "Difficulty" },
  { value: "category", label: "Category" },
];

export default function GamesScreen() {
  const theme = useTheme<AppTheme>();
  const games = useGames();
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("popularity");
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORY);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>(DIFFICULTY_FILTERS[0]);
  const [playerFilter, setPlayerFilter] = useState("");
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const { width } = useWindowDimensions();
  const isCompact = width < 680;

  const selectedSortLabel = useMemo(() => {
    const match = SORT_OPTIONS.find((option) => option.value === sortOption);
    return match ? match.label : SORT_OPTIONS[0].label;
  }, [sortOption]);

  const hasActiveFilters = useMemo(
    () =>
      selectedCategory !== DEFAULT_CATEGORY ||
      selectedDifficulty !== DIFFICULTY_FILTERS[0],
    [selectedCategory, selectedDifficulty],
  );

  const handleResetFilters = useCallback(() => {
    setSelectedCategory(DEFAULT_CATEGORY);
    setSelectedDifficulty(DIFFICULTY_FILTERS[0]);
  }, []);

  const normalizeCategory = useCallback((category?: string | null) => {
    const trimmed = category?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : "Uncategorized";
  }, []);

  const normalizeDifficulty = useCallback((difficulty?: string | null) => {
    const trimmed = difficulty?.trim();
    if (!trimmed) return "";
    const lowered = trimmed.toLowerCase();
    if (lowered.startsWith("easy")) return "Easy";
    if (lowered.startsWith("medium")) return "Medium";
    if (lowered.startsWith("hard")) return "Hard";
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  }, []);

  const getDifficultyScore = useCallback((difficulty?: string | null) => {
    switch (normalizeDifficulty(difficulty)) {
      case "Easy":
        return 0;
      case "Medium":
        return 1;
      case "Hard":
        return 2;
      default:
        return 999;
    }
  }, [normalizeDifficulty]);

  const parsedPlayerRange = useMemo(() => {
    const input = playerFilter.trim();
    if (!input) return null;

    const sanitized = input.replace(/\s+/g, "");
    const rangeMatch = sanitized.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const [min, max] = rangeMatch.slice(1).map(Number);
      if (Number.isFinite(min) && Number.isFinite(max)) {
        return { min: Math.min(min, max), max: Math.max(min, max) };
      }
    }

    const singleMatch = sanitized.match(/^(\d+)$/);
    if (singleMatch) {
      const value = Number(singleMatch[1]);
      if (Number.isFinite(value)) {
        return { min: value, max: value };
      }
    }

    return null;
  }, [playerFilter]);

  const searchedGames = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return games;
    }
    return games.filter((gameItem) =>
      gameItem.name?.toLowerCase().includes(query),
    );
  }, [games, searchQuery]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    searchedGames.forEach((game) => {
      set.add(normalizeCategory(game.category));
    });
    return [DEFAULT_CATEGORY, ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [searchedGames, normalizeCategory]);

  useEffect(() => {
    if (selectedCategory !== DEFAULT_CATEGORY && !categories.includes(selectedCategory)) {
      setSelectedCategory(DEFAULT_CATEGORY);
    }
  }, [categories, selectedCategory]);

  const getGamePlayerRange = useCallback((game: Game) => {
    const rawMin = (game as any).minPlayers ?? game.minPlayers ?? null;
    const rawMax = (game as any).maxPlayers ?? game.maxPlayers ?? null;

    const parseFromString = (value?: string | null) => {
      if (!value) return null;
      const matchRange = value.match(/(\d+)\s*-\s*(\d+)/);
      if (matchRange) {
        const min = Number(matchRange[1]);
        const max = Number(matchRange[2]);
        if (Number.isFinite(min) && Number.isFinite(max)) {
          return { min, max };
        }
      }
      const matchSingle = value.match(/(\d+)\s*\+/);
      if (matchSingle) {
        const min = Number(matchSingle[1]);
        if (Number.isFinite(min)) {
          return { min, max: Number.MAX_SAFE_INTEGER };
        }
      }
      return null;
    };

    const sanitizedMin = typeof rawMin === "number" && Number.isFinite(rawMin) && rawMin > 0 ? rawMin : null;
    const sanitizedMax = typeof rawMax === "number" && Number.isFinite(rawMax) && rawMax > 0 ? rawMax : null;

    if (sanitizedMin !== null && sanitizedMax !== null) {
      return { min: sanitizedMin, max: sanitizedMax };
    }
    if (sanitizedMin !== null) {
      return { min: sanitizedMin, max: sanitizedMax ?? Number.MAX_SAFE_INTEGER };
    }

    return parseFromString(game.players);
  }, []);

  const processedGames = useMemo(() => {
    let list: Game[] = searchedGames;

    if (selectedCategory !== DEFAULT_CATEGORY) {
      list = list.filter((game) => normalizeCategory(game.category) === selectedCategory);
    }

    if (selectedDifficulty !== DIFFICULTY_FILTERS[0]) {
      list = list.filter((game) => normalizeDifficulty(game.difficulty) === selectedDifficulty);
    }

    if (parsedPlayerRange) {
      list = list.filter((game) => {
        const range = getGamePlayerRange(game);
        if (!range) return false;
        const boundedGameRange = {
          min: range.min,
          max: Number.isFinite(range.max) ? range.max : Number.MAX_SAFE_INTEGER,
        };

        return (
          boundedGameRange.min <= parsedPlayerRange.min &&
          boundedGameRange.max >= parsedPlayerRange.max
        );
      });
    }

    const sorted = [...list];
    switch (sortOption) {
      case "name":
        sorted.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
        break;
      case "difficulty":
        sorted.sort((a, b) => {
          const scoreA = getDifficultyScore(a.difficulty);
          const scoreB = getDifficultyScore(b.difficulty);
          if (scoreA !== scoreB) return scoreA - scoreB;
          return (a.name ?? "").localeCompare(b.name ?? "");
        });
        break;
      case "category":
        sorted.sort((a, b) => {
          const catA = normalizeCategory(a.category);
          const catB = normalizeCategory(b.category);
          if (catA !== catB) return catA.localeCompare(catB);
          return (a.name ?? "").localeCompare(b.name ?? "");
        });
        break;
      case "popularity":
      default:
        sorted.sort((a, b) => {
          const rankA = typeof a.rank === "number" && Number.isFinite(a.rank) ? a.rank : Number.POSITIVE_INFINITY;
          const rankB = typeof b.rank === "number" && Number.isFinite(b.rank) ? b.rank : Number.POSITIVE_INFINITY;
          if (rankA !== rankB) return rankA - rankB;
          return (a.name ?? "").localeCompare(b.name ?? "");
        });
        break;
    }

    return sorted;
  }, [searchedGames, selectedCategory, selectedDifficulty, sortOption, normalizeCategory, normalizeDifficulty, getDifficultyScore, parsedPlayerRange, getGamePlayerRange]);

  const totalPages = Math.max(1, Math.ceil(processedGames.length / PAGE_SIZE));
  const windowSize = isCompact ? 3 : PAGE_WINDOW;

  useEffect(() => {
    setPage(0);
  }, [games.length, searchQuery, selectedCategory, selectedDifficulty, sortOption, parsedPlayerRange]);

  useEffect(() => {
    if (isCompact && sortMenuVisible) {
      setSortMenuVisible(false);
    }
  }, [isCompact, sortMenuVisible]);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages]);

  const visibleGames = useMemo(() => {
    const start = page * PAGE_SIZE;
    return processedGames.slice(start, start + PAGE_SIZE);
  }, [processedGames, page]);

  const canGoPrev = page > 0;
  const canGoNext = page < totalPages - 1;

  const pageNumbers = useMemo(() => {
    if (totalPages <= windowSize) {
      return Array.from({ length: totalPages }, (_, index) => index);
    }

    const half = Math.floor(windowSize / 2);
    let start = Math.max(page - half, 0);
    let end = start + windowSize;

    if (end > totalPages) {
      end = totalPages;
      start = end - windowSize;
    }

    return Array.from({ length: end - start }, (_, index) => start + index);
  }, [page, totalPages, windowSize]);

  const renderPageButton = useCallback(
    (pageIndex: number) => {
      const isActive = pageIndex === page;

      if (isCompact) {
        return (
          <TouchableOpacity
            key={pageIndex}
            onPress={() => setPage(pageIndex)}
            activeOpacity={0.7}
            style={[
              gamesScreenStyles.pageNumberChip,
              isCompact && gamesScreenStyles.pageNumberChipCompact,
              isActive && {
                backgroundColor: theme.colors.primary,
              },
            ]}
          >
            <Text
              style={[
                gamesScreenStyles.pageNumberChipText,
                isCompact && gamesScreenStyles.pageNumberChipTextCompact,
                {
                  color: isActive
                    ? theme.colors.onPrimary
                    : theme.colors.onSurface,
                },
              ]}
            >
              {pageIndex + 1}
            </Text>
          </TouchableOpacity>
        );
      }

      return (
        <Button
          key={pageIndex}
          compact
          mode={isActive ? "contained" : "text"}
          onPress={() => setPage(pageIndex)}
          style={gamesScreenStyles.pageNumberButton}
          contentStyle={gamesScreenStyles.pageNumberButtonContent}
          labelStyle={[
            gamesScreenStyles.pageNumberButtonLabel,
            !isActive && { color: theme.colors.onSurfaceVariant },
          ]}
          uppercase={false}
        >
          {pageIndex + 1}
        </Button>
      );
    },
    [isCompact, page, theme.colors.onPrimary, theme.colors.onSurface, theme.colors.onSurfaceVariant],
  );

  return (
    <View
      style={[gamesScreenStyles.root, { backgroundColor: theme.colors.background }]}
    >
      <View style={gamesScreenStyles.centeredContainer}>
        <Text variant="titleLarge" style={gamesScreenStyles.text}>
          Games
        </Text>

        <View style={gamesScreenStyles.searchBarContainer}>
          <Searchbar
            placeholder="Search games"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[
              gamesScreenStyles.searchBar,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
            inputStyle={[
              gamesScreenStyles.searchBarInput,
              { color: theme.colors.onSurface },
            ]}
            iconColor={theme.colors.onSurfaceVariant}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            right={(props) => (
              <IconButton
                {...props}
                icon="filter-variant"
                size={22}
                onPress={() => setFilterModalVisible(true)}
                iconColor={
                  hasActiveFilters
                    ? theme.colors.primary
                    : props.color ?? theme.colors.onSurfaceVariant
                }
                accessibilityLabel="Open filters"
              />
            )}
          />
        </View>

        <View
          style={[
            gamesScreenStyles.filtersContainer,
            isCompact && gamesScreenStyles.filtersContainerCompact,
            !isCompact && gamesScreenStyles.filtersContainerWide,
          ]}
        >
          <View
            style={[
              gamesScreenStyles.filtersTopRow,
              !isCompact && gamesScreenStyles.filtersTopRowWide,
            ]}
          >
            {isCompact ? (
              <SegmentedButtons
                value={sortOption}
                onValueChange={(value) => setSortOption(value as SortOption)}
                style={gamesScreenStyles.sortSegmentedGroup}
                density="small"
                buttons={SORT_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                  style: gamesScreenStyles.sortSegmentedButton,
                  labelStyle: gamesScreenStyles.sortSegmentedButtonLabel,
                }))}
              />
            ) : (
              <View
                style={[
                  gamesScreenStyles.sortDropdownWrapper,
                  gamesScreenStyles.sortDropdownWrapperWide,
                ]}
              >
                <Menu
                  visible={sortMenuVisible}
                  onDismiss={() => setSortMenuVisible(false)}
                  style={gamesScreenStyles.sortMenuWrapper}
                  contentStyle={[
                    gamesScreenStyles.sortMenuContent,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      borderColor: theme.colors.outlineVariant ?? theme.colors.outline,
                    },
                  ]}
                  anchorPosition="bottom"
                  anchor={
                    <Button
                      mode="contained-tonal"
                      onPress={() => setSortMenuVisible(true)}
                      style={[
                        gamesScreenStyles.sortDropdownButton,
                        gamesScreenStyles.sortDropdownButtonWide,
                      ]}
                      contentStyle={gamesScreenStyles.sortDropdownButtonContent}
                      labelStyle={gamesScreenStyles.sortDropdownButtonLabel}
                      icon="tune"
                      iconColor={theme.colors.onSurfaceVariant}
                      buttonColor={theme.colors.surfaceVariant}
                      textColor={theme.colors.onSurface}
                      uppercase={false}
                    >
                      Sort: {selectedSortLabel}
                    </Button>
                  }
                >
                  {SORT_OPTIONS.map((option) => (
                    <Menu.Item
                      key={option.value}
                      onPress={() => {
                        setSortOption(option.value);
                        setSortMenuVisible(false);
                      }}
                      title={option.label}
                      style={gamesScreenStyles.sortMenuItem}
                      titleStyle={[
                        gamesScreenStyles.sortMenuItemTitle,
                        option.value === sortOption && { color: theme.colors.primary },
                      ]}
                      leadingIcon={
                        option.value === sortOption
                          ? ({ size }) => (
                              <Icon
                                source="check"
                                size={size}
                                color={theme.colors.primary}
                              />
                            )
                          : undefined
                      }
                      rippleColor={theme.colors.surface}
                    />
                  ))}
                </Menu>
              </View>
            )}

            {!isCompact && (
              <Searchbar
                placeholder="Players (e.g. 3 or 2-5)"
                value={playerFilter}
                onChangeText={setPlayerFilter}
                style={[
                  gamesScreenStyles.playerFilter,
                  gamesScreenStyles.playerFilterWide,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
                inputStyle={[
                  gamesScreenStyles.searchBarInput,
                  gamesScreenStyles.playerFilterInput,
                  { color: theme.colors.onSurface },
                ]}
                icon="account-multiple-outline"
                iconColor={theme.colors.onSurfaceVariant}
                autoCorrect={false}
              />
            )}
          </View>

          {isCompact && (
            <Searchbar
              placeholder="Players (e.g. 3 or 2-5)"
              value={playerFilter}
              onChangeText={setPlayerFilter}
              style={[
                gamesScreenStyles.playerFilter,
                gamesScreenStyles.playerFilterCompact,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
              inputStyle={[
                gamesScreenStyles.searchBarInput,
                gamesScreenStyles.playerFilterInput,
                { color: theme.colors.onSurface },
              ]}
              icon="account-multiple-outline"
              iconColor={theme.colors.onSurfaceVariant}
              autoCorrect={false}
            />
          )}
        </View>

        <Portal>
          <Modal
            visible={filterModalVisible}
            onDismiss={() => setFilterModalVisible(false)}
            contentContainerStyle={[
              gamesScreenStyles.filterModal,
              { backgroundColor: "#000000", borderColor: theme.colors.primary },
            ]}
          >
            <Text variant="titleMedium" style={gamesScreenStyles.filterModalTitle}>
              Filters
            </Text>

            <Text variant="labelLarge" style={gamesScreenStyles.filterSectionLabel}>
              Difficulty
            </Text>
            <View style={gamesScreenStyles.filterChipGroup}>
              {DIFFICULTY_FILTERS.map((difficulty) => (
                <Chip
                  key={difficulty}
                  mode={selectedDifficulty === difficulty ? "flat" : "outlined"}
                  selected={selectedDifficulty === difficulty}
                  onPress={() => setSelectedDifficulty(difficulty)}
                  style={gamesScreenStyles.filterChip}
                >
                  {difficulty}
                </Chip>
              ))}
            </View>

            <Divider
              style={[
                gamesScreenStyles.filterDivider,
                { backgroundColor: theme.colors.outline },
              ]}
            />

            <Text variant="labelLarge" style={gamesScreenStyles.filterSectionLabel}>
              Category
            </Text>
            <ScrollView
              style={gamesScreenStyles.filterCategoriesScroll}
              contentContainerStyle={gamesScreenStyles.filterCategoriesContent}
              showsVerticalScrollIndicator={false}
            >
              {categories.map((category) => (
                <Chip
                  key={category}
                  mode={selectedCategory === category ? "flat" : "outlined"}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                  style={gamesScreenStyles.filterChip}
                >
                  {category}
                </Chip>
              ))}
            </ScrollView>

            <View style={gamesScreenStyles.filterActions}>
              <Button
                mode="text"
                onPress={handleResetFilters}
                disabled={!hasActiveFilters}
                uppercase={false}
              >
                Reset
              </Button>
              <Button
                mode="contained"
                onPress={() => setFilterModalVisible(false)}
                uppercase={false}
              >
                Done
              </Button>
            </View>
          </Modal>
        </Portal>

        <FlatList
          data={visibleGames}
          keyExtractor={(item: Game) => String(item.id)}
          renderItem={({ item }) => <GameCard game={item} page="Games" />}
          extraData={page}
          initialNumToRender={PAGE_SIZE}
          windowSize={7}
          maxToRenderPerBatch={PAGE_SIZE}
          removeClippedSubviews
          ListEmptyComponent={
            <Text style={gamesScreenStyles.emptyState}>
              {searchQuery.trim()
                ? "No games match your search."
                : "No games found."}
            </Text>
          }
          contentContainerStyle={gamesScreenStyles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {games.length > 0 && (
          <>
            <Divider
              style={[
                gamesScreenStyles.paginationDivider,
                { backgroundColor: theme.colors.outline },
              ]}
            />

            <View
              style={[
                gamesScreenStyles.paginationContainer,
                isCompact && gamesScreenStyles.paginationContainerCompact,
              ]}
            >
              <View
                style={[
                  gamesScreenStyles.paginationArrowWrapper,
                  isCompact && gamesScreenStyles.paginationArrowWrapperCompact,
                ]}
              >
                {isCompact ? (
                  <IconButton
                    icon="chevron-left"
                    mode="outlined"
                    size={20}
                    onPress={() => setPage((prev) => Math.max(prev - 1, 0))}
                    disabled={!canGoPrev}
                    style={gamesScreenStyles.paginationIconButton}
                    contentStyle={gamesScreenStyles.paginationIconButtonContent}
                    rippleColor="transparent"
                  />
                ) : (
                  <Button
                    compact
                    mode="outlined"
                    onPress={() => setPage((prev) => Math.max(prev - 1, 0))}
                    disabled={!canGoPrev}
                    style={gamesScreenStyles.paginationButton}
                    contentStyle={gamesScreenStyles.paginationButtonContent}
                    labelStyle={gamesScreenStyles.paginationButtonLabel}
                    uppercase={false}
                  >
                    Previous
                  </Button>
                )}
              </View>

              <View
                style={[
                  gamesScreenStyles.pageNumbersSection,
                  isCompact && gamesScreenStyles.pageNumbersSectionCompact,
                ]}
              >
                <View
                  style={[
                    gamesScreenStyles.pageNumberGroup,
                    isCompact && gamesScreenStyles.pageNumberGroupCompact,
                  ]}
                >
                  {pageNumbers[0] > 0 && (
                    <>
                      {renderPageButton(0)}
                      {pageNumbers[0] > 1 && (
                        <Text
                          style={[
                            gamesScreenStyles.ellipsis,
                            isCompact && gamesScreenStyles.ellipsisCompact,
                          ]}
                        >
                          ...
                        </Text>
                      )}
                    </>
                  )}

                  {pageNumbers.map(renderPageButton)}

                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                    <>
                      {pageNumbers[pageNumbers.length - 1] < totalPages - 2 && (
                        <Text
                          style={[
                            gamesScreenStyles.ellipsis,
                            isCompact && gamesScreenStyles.ellipsisCompact,
                          ]}
                        >
                          ...
                        </Text>
                      )}
                      {renderPageButton(totalPages - 1)}
                    </>
                  )}
                </View>
              </View>

              <View
                style={[
                  gamesScreenStyles.paginationArrowWrapper,
                  isCompact && gamesScreenStyles.paginationArrowWrapperCompact,
                ]}
              >
                {isCompact ? (
                  <IconButton
                    icon="chevron-right"
                    mode="outlined"
                    size={20}
                    onPress={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                    disabled={!canGoNext}
                    style={gamesScreenStyles.paginationIconButton}
                    contentStyle={gamesScreenStyles.paginationIconButtonContent}
                    rippleColor="transparent"
                  />
                ) : (
                  <Button
                    compact
                    mode="outlined"
                    onPress={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                    disabled={!canGoNext}
                    style={gamesScreenStyles.paginationButton}
                    contentStyle={gamesScreenStyles.paginationButtonContent}
                    labelStyle={gamesScreenStyles.paginationButtonLabel}
                    uppercase={false}
                  >
                    Next
                  </Button>
                )}
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

