export type ActiveGameNightCardProps = {
  title: string;
  date: string;
  location: string;
  members: string[]; // avatar URLs
  onMessagePress?: () => void;
  onViewPress?: () => void;
  onDeletePress: () => void;
};
