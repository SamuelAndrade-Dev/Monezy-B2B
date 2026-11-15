import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { auth, firebaseConfigured } from "./client";

function requireAuth() {
  if (!firebaseConfigured || !auth) {
    throw new Error("Firebase Authentication não está configurado. Confira as variáveis EXPO_PUBLIC_FIREBASE_*.");
  }
  return auth;
}

export function subscribeToAuth(callback) {
  if (!firebaseConfigured || !auth) return () => {};
  return onAuthStateChanged(auth, callback);
}

export async function signIn(email, password) {
  const result = await signInWithEmailAndPassword(requireAuth(), email.trim(), password);
  return result.user;
}

export async function signOutUser() {
  await signOut(requireAuth());
}

export async function getIdToken(user) {
  if (!user) throw new Error("É necessário entrar para acessar a API.");
  return user.getIdToken();
}
