import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth
} from "firebase/auth";
import { getApp, getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey?.trim() &&
  firebaseConfig.authDomain?.trim() &&
  firebaseConfig.projectId?.trim() &&
  firebaseConfig.appId?.trim()
);
export const missingFirebaseConfig = [
  ["EXPO_PUBLIC_FIREBASE_API_KEY", firebaseConfig.apiKey],
  ["EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN", firebaseConfig.authDomain],
  ["EXPO_PUBLIC_FIREBASE_PROJECT_ID", firebaseConfig.projectId],
  ["EXPO_PUBLIC_FIREBASE_APP_ID", firebaseConfig.appId]
]
  .filter(([, value]) => !value?.trim())
  .map(([name]) => name);

const app = firebaseConfigured
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null;

function createAuth() {
  if (!app) return null;
  if (Platform.OS === "web") return getAuth(app);

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (error) {
    if (error.code === "auth/already-initialized") return getAuth(app);
    throw error;
  }
}

export const auth = createAuth();
