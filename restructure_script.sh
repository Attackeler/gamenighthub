#!/bin/bash

# Base project directory
BASE_DIR="gamenighthub"
SRC_DIR="$BASE_DIR/src"

# Create new directory structure
mkdir -p $SRC_DIR/{app,layout,components/{game,sections,shared},contexts,hooks,screens,themes,types}

# Move app files
mv $BASE_DIR/app/* $SRC_DIR/app/

# Move layout files
mv $BASE_DIR/components/Header.tsx $SRC_DIR/layout/
mv $BASE_DIR/components/BottomTabs.tsx $SRC_DIR/layout/

# Move component files
mv $BASE_DIR/components/GameCard.tsx $SRC_DIR/components/game/
mv $BASE_DIR/components/CreateGameNightModal.tsx $SRC_DIR/components/game/
mv $BASE_DIR/components/sections/* $SRC_DIR/components/sections/
mv $BASE_DIR/components/Section.tsx $SRC_DIR/components/shared/

# Move context
mv $BASE_DIR/contexts/* $SRC_DIR/contexts/

# Move hooks
mv $BASE_DIR/hooks/* $SRC_DIR/hooks/

# Move screens
mv $BASE_DIR/screens/* $SRC_DIR/screens/

# Move themes
mv $BASE_DIR/themes/* $SRC_DIR/themes/

# Move types
mv $BASE_DIR/types/* $SRC_DIR/types/

# Move root typescript env file
mv $BASE_DIR/expo-env.d.ts $SRC_DIR/

# Clean up old empty folders
find $BASE_DIR -type d -empty -delete

# Done
echo "✅ Project restructured under src/"
