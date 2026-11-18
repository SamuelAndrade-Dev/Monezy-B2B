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

export function getAuthErrorMessage(error) {
  const messages = {
    "auth/invalid-email": "Informe um endereço de e-mail válido.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/user-disabled": "Esta conta está desativada.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde e tente novamente.",
    "auth/network-request-failed": "Não foi possível conectar ao Firebase. Verifique sua rede."
  };
  return messages[error?.code] || error?.message || "Não foi possível autenticar.";
}

export async function signOutUser() {
  await signOut(requireAuth());
}

export async function getIdToken(user) {
  if (!user) throw new Error("É necessário entrar para acessar a API.");
  return user.getIdToken();
}
