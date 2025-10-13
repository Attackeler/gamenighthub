# Game Night Hub

A React Native + Expo app for organizing and discovering board game nights. The project uses Expo Router on the web, React Navigation for tabs, React Native Paper for theming, and Firebase for data storage.

## Requirements

- Node.js 18+
- npm 9+
- Expo CLI (
px expo installs automatically per command)
- Firebase project configured for Firestore (update the config in src/lib/firebase.ts)

## Getting Started

`ash
npm install
npm run start           # Launch Expo Dev Tools
npm run web             # Start the web build directly
`

The dev server prints a QR code for testing on devices. Choose w inside the Expo CLI to open the web build if you started with 
pm run start.

### Firebase Rules

The repository includes permissive local development rules in irestore.rules. Publish them through the Firebase console (Firestore ? Rules ? Publish) or via the CLI after installing irebase-tools. Replace these with authenticated rules before production.

## Project Scripts

- 
pm run start – start Expo in interactive mode
- 
pm run web – start Expo in web-only mode
- 
pm run android / 
pm run ios – start Expo targeting a specific platform
- 
pm test – run Jest (no suite defined yet)

## Architecture

The source tree follows a feature-first layout with shared app infrastructure extracted into dedicated namespaces.

`
src/
+- app/
¦  +- navigation/        # Navigation primitives (tabs, header)
¦  +- providers/         # Global providers (theme)
¦  +- theme/             # Theme tokens, types, palette definitions
+- features/
¦  +- games/             # Games feature components, hooks, screens, types
¦  +- home/              # Home feature components, hooks, screens
+- shared/
¦  +- components/        # Cross-feature UI like Section
¦  +- hooks/             # Reusable shared hooks
¦  +- screens/           # Generic screens (e.g., Placeholder)
+- lib/                  # Integrations (Firebase client)
+- types/                # Global ambient type declarations
`

Feature folders bundle screens, hooks, and components that belong together, making it easier to scale the app or add new tabs without touching other features.

## Adding New Features

1. Create a folder under src/features/<feature-name>.
2. Co-locate screens, hooks, and UI specific to that feature.
3. Register the screen in a navigator (e.g., update src/app/navigation/bottom-tabs/TabConfig.tsx).
4. Export any shared UI through src/shared if it will be reused elsewhere.

## Troubleshooting

- If the web build shows Unmatched Route, run 
px expo start --web --clear to rebuild the Expo Router manifest.
- Firestore errors such as Missing or insufficient permissions usually mean the deployed rules are outdated.

## License

This project is provided as-is for internal use.

## BoardGameGeek Integration

The repository now includes Firebase Cloud Functions under unctions/ that proxy the BoardGameGeek XML API, normalize records, and cache them in Firestore so the app can read data quickly without hammering BGG.

1. cd functions
2. npm install
3. npm run build (or npm run serve to use the emulator)
4. firebase deploy --only functions

The deployment exposes two HTTPS endpoints (region matches your Firebase project):
- bggSearch?query=<name>: lightweight typeahead results
- bggThing?id=<id>: full metadata import (stores/reads /games/{bggId} with a 30-day TTL)

Configure Expo with the base URL of your deployed functions by setting EXPO_PUBLIC_FUNCTIONS_URL (e.g., in app.config.js or .env):

EXPO_PUBLIC_FUNCTIONS_URL=https://us-central1-<your-project>.cloudfunctions.net

With that in place you can call searchBoardGames / importBoardGame from src/features/games/services/bggApi.ts or hit the endpoints from scripts. Remember to respect BoardGameGeek’s terms—cache responses, rate-limit, and provide attribution where appropriate.

