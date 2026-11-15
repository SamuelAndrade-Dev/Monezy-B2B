import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, assertFirebaseConfigured } from "./firebase";
export function translateAuthError(error) {
  const map = {
    "auth/invalid-email": "E-mail inválido.",
    "auth/email-already-in-use": "Este e-mail já está cadastrado.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
    "auth/network-request-failed": "Falha de conexão. Verifique sua internet.",
  };
  return map[error?.code] || error?.message || "Não foi possível autenticar.";
}
export async function login(email, password) {
  assertFirebaseConfigured();
  return signInWithEmailAndPassword(auth, email.trim(), password);
}
export async function register(email, password) {
  assertFirebaseConfigured();
  return createUserWithEmailAndPassword(auth, email.trim(), password);
}
export async function logout() {
  assertFirebaseConfigured();
  return signOut(auth);
}
