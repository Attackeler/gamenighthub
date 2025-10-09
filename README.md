# GameNightHub

GameNightHub is an Expo + React Native application that helps groups organise and discover tabletop game nights. The app showcases upcoming sessions, highlights popular games sourced from Firestore, and provides quick actions for planning new events across native and web targets.

## Tech Stack

- **Framework:** [Expo](https://expo.dev) with React Native and Expo Router
- **UI Kit:** React Native Paper, Expo vector icons
- **State & Context:** React Context for theming, AsyncStorage for persistence
- **Backend Services:** Firebase (Firestore + Analytics)
- **Testing:** Jest with `jest-expo`

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Run the app**
   - Start the Metro bundler: `npm run start`
   - Launch a platform target:
     - Android: `npm run android`
     - iOS (requires macOS + Xcode): `npm run ios`
     - Web: `npm run web`
3. **Execute tests**
   ```bash
   npm test
   ```

> **Note:** The app expects Firebase web credentials to be available (already configured in the repository). Ensure Firestore has a `games` collection for the games catalogue.

## Project Structure

The project follows a layered structure that separates application scaffolding, feature-specific logic, and shared utilities.

```
app/                     Expo Router entry points and layout loaders
└── layout/              Font loading helper used during app bootstrap
src/
├── app/
│   ├── navigation/      Header and bottom tab navigator implementations
│   ├── providers/       Application-level providers (theme context)
│   └── theme/           Light/Dark theme tokens shared across the app
├── features/
│   ├── games/           Game catalogue UI, hooks, and modals
│   └── home/            Home dashboard screen and supporting components
├── shared/
│   ├── hooks/           Cross-cutting hooks (e.g., color scheme shims)
│   ├── lib/             External service wrappers (Firebase client)
│   ├── screens/         Reusable fallback screens for unfinished tabs
│   └── ui/              Shared presentational components (e.g., Section)
└── types/               Type augmentations for third-party libraries
```

This organisation keeps feature concerns (e.g., home dashboard, games catalogue) collocated while centralising navigation, theme management, and shared utilities for reuse.

## Key Features

- **Theme Toggle:** A custom provider wraps the app with light/dark themes persisted via AsyncStorage, and exposes a toggle button in the global header.
- **Bottom Tab Navigation:** Expo Router loads a React Navigation bottom tab navigator with dedicated screens for Home and Games, plus placeholder routes for upcoming sections.
- **Game Night Planner:** The Home screen includes quick actions and a modal form for creating game nights, along with cards that visualise active sessions.
- **Firestore Integration:** The Games screen retrieves game metadata from Firestore via a shared Firebase client and renders reusable game cards.

## Development Tips

- Feature additions should live under `src/features/<feature-name>` to keep UI, hooks, and types together.
- Shared logic that crosses feature boundaries belongs under `src/shared`.
- Navigation-level changes (tabs, headers) should be implemented within `src/app/navigation` so they remain decoupled from feature details.
- Theme customisation can be performed by editing the tokens in `src/app/theme` and the provider hook in `src/app/providers/theme`.

## Testing & Quality

- Run `npm test` to execute Jest suites.
- Prefer TypeScript path aliases (`@/...`) when importing from `src` to keep imports concise and resilient to future refactors.
- For Firebase-dependent hooks, ensure Firestore security rules allow read access during development or provide mock data when offline.
