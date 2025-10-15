import { Platform, StyleSheet } from 'react-native';

export const gamesScreenStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centeredContainer: {
    width: '96%',
    maxWidth: 980,
    alignSelf: 'center',
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 12,
    marginLeft: 10,
  },
  searchBarContainer: {
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchBar: {
    borderRadius: 24,
    elevation: 0,
    height: 44,
    minHeight: 44,
    paddingVertical: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBarInput: {
    fontSize: 15,
    paddingVertical: 0,
    height: 44,
    lineHeight: Platform.select({ ios: 20, default: 44 }),
    textAlignVertical: "center",
    includeFontPadding: false,
    minHeight: 0,
    paddingTop: Platform.select({ ios: 2, default: 0 }),
    paddingBottom: Platform.select({ ios: 0, default: 0 }),
  },
  filtersContainer: {
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 12,
    gap: 8,
  },
  filtersContainerCompact: {
    gap: 6,
  },
  filtersContainerWide: {
    gap: 12,
  },
  filtersTopRow: {
    width: "100%",
    flexDirection: "column",
    gap: 8,
    alignItems: "stretch",
  },
  filtersTopRowWide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sortDropdownWrapper: {
    width: "100%",
  },
  sortDropdownWrapperWide: {
    flex: 1,
  },
  sortSegmentedGroup: {
    width: '100%',
  },
  sortSegmentedButton: {
    minWidth: 80,
    flex: 1,
  },
  sortSegmentedButtonLabel: {
    fontSize: 13,
  },
  sortDropdownButton: {
    borderRadius: 24,
    width: "100%",
    minHeight: 44,
  },
  sortDropdownButtonWide: {
    alignSelf: "stretch",
  },
  sortDropdownButtonContent: {
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  sortDropdownButtonLabel: {
    fontSize: 15,
    textTransform: "none",
    textAlign: "left",
  },
  sortMenuWrapper: {
    marginTop: 4,
  },
  sortMenuContent: {
    borderRadius: 16,
    paddingVertical: 4,
    minWidth: 190,
    borderWidth: 1,
  },
  sortMenuItem: {
    minHeight: 44,
    paddingHorizontal: 12,
  },
  sortMenuItemTitle: {
    fontSize: 15,
  },
  filterModal: {
    marginHorizontal: 16,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    maxHeight: 520,
    width: "92%",
    maxWidth: 520,
    alignSelf: "center",
    borderWidth: 1,
  },
  filterModalTitle: {
    marginBottom: 12,
  },
  filterSectionLabel: {
    marginTop: 4,
    marginBottom: 8,
    fontWeight: "600",
  },
  filterChipGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  filterChip: {
    marginRight: 0,
  },
  filterDivider: {
    marginVertical: 16,
    height: 1,
  },
  filterCategoriesScroll: {
    maxHeight: 220,
  },
  filterCategoriesContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingBottom: 4,
  },
  filterActions: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  playerFilter: {
    borderRadius: 24,
    elevation: 0,
    height: 44,
    minHeight: 44,
    paddingVertical: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  playerFilterCompact: {
    marginTop: 6,
  },
  playerFilterWide: {
    width: 220,
  },
  playerFilterInput: {
    lineHeight: Platform.select({ ios: 20, default: 44 }),
    paddingTop: Platform.select({ ios: 2, web: 2, default: 0 }),
    paddingBottom: Platform.select({ ios: 0, web: 0, default: 0 }),
    textAlign: "left",
  },
  emptyState: {
    marginLeft: 10,
    marginTop: 12,
  },
  paginationDivider: {
    height: 1,
    marginHorizontal: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 12,
    paddingBottom: 16,
    gap: 12,
  },
  paginationContainerCompact: {
    flexWrap: 'nowrap',
    gap: 8,
    paddingHorizontal: 8,
  },
  paginationArrowWrapper: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 88,
  },
  paginationArrowWrapperCompact: {
    minWidth: 44,
  },
  paginationButton: {
    minWidth: 88,
    borderRadius: 18,
    marginHorizontal: 0,
  },
  paginationButtonContent: {
    height: 32,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationButtonLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  paginationButtonLabelCompact: {
    fontSize: 11,
  },
  pageNumbersSection: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNumbersSectionCompact: {
    flexGrow: 0,
  },
  pageNumberGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  pageNumberGroupCompact: {
    flexWrap: 'nowrap',
    gap: 4,
  },
  pageNumberButton: {
    borderRadius: 16,
    minWidth: 32,
    height: 30,
  },
  pageNumberButtonCompact: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
  },
  pageNumberButtonContent: {
    height: 30,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNumberButtonContentCompact: {
    height: 30,
    width: 30,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNumberButtonLabel: {
    fontWeight: '600',
    fontSize: 13,
  },
  pageNumberButtonLabelCompact: {
    fontWeight: '600',
    fontSize: 12,
  },
  pageNumberChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
    minWidth: 40,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageNumberChipCompact: {
    paddingHorizontal: 8,
    marginHorizontal: 2,
    minWidth: 32,
    minHeight: 32,
  },
  pageNumberChipText: {
    fontWeight: '600',
    fontSize: 13,
  },
  pageNumberChipTextCompact: {
    fontSize: 12,
  },
  ellipsis: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.6,
    marginHorizontal: 4,
  },
  ellipsisCompact: {
    marginHorizontal: 2,
  },
  paginationIconButton: {
    borderRadius: 20,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  paginationIconButtonContent: {
    margin: 0,
    flex: 1,
  },
});
