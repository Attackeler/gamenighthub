import { StyleSheet } from 'react-native';

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
