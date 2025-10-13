import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Button, Divider, IconButton, Text, useTheme } from "react-native-paper";

import GameCard from "@/features/games/components/game-card/GameCard";
import { useGames } from "@/features/games/hooks/useGames";
import type { Game } from "@/features/games/types";
import { AppTheme } from "@/app/theme/types";

import { gamesScreenStyles } from "./GamesScreen.styles";

const PAGE_SIZE = 10;
const PAGE_WINDOW = 5;

export default function GamesScreen() {
  const theme = useTheme<AppTheme>();
  const games = useGames();
  const [page, setPage] = useState(0);
  const { width } = useWindowDimensions();
  const isCompact = width < 680;

  const totalPages = Math.max(1, Math.ceil(games.length / PAGE_SIZE));
  const windowSize = isCompact ? 3 : PAGE_WINDOW;

  useEffect(() => {
    setPage(0);
  }, [games.length]);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages]);

  const visibleGames = useMemo(() => {
    const start = page * PAGE_SIZE;
    return games.slice(start, start + PAGE_SIZE);
  }, [games, page]);

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

        <FlatList
          data={visibleGames}
          keyExtractor={(item: Game) => String(item.id)}
          renderItem={({ item }) => <GameCard game={item} page="Games" />}
          extraData={page}
          ListEmptyComponent={
            <Text style={gamesScreenStyles.emptyState}>No games found.</Text>
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
