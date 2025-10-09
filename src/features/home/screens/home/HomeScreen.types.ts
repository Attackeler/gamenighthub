export type GameNight = {
  id: string;
  title: string;
  date: string;
  location: string;
  members: string[];
};

export type TabParamList = {
  home: undefined;
  games: undefined;
  // ...other tabs
};
