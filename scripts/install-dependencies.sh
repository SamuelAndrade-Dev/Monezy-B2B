#!/usr/bin/env bash
set -e
npm install
npx expo install expo-router expo-constants expo-linking expo-status-bar react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated react-native-svg firebase react-native-paper
npm install zustand nativewind
npm install -D tailwindcss@^3.4.17
npx expo install --fix
