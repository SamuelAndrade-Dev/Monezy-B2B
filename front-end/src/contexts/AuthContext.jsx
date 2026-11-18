import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getIdToken,
  signIn,
  signOutUser,
  subscribeToAuth
} from "../services/firebase/auth";
import { firebaseConfigured } from "../services/firebase/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(firebaseConfigured);

  useEffect(() => {
    if (!firebaseConfigured) return undefined;
    return subscribeToAuth((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const value = useMemo(() => ({
    user,
    demoMode,
    isAuthenticated: Boolean(user) || demoMode,
    loading,
    configured: firebaseConfigured,
    signIn,
    startDemo: () => setDemoMode(true),
    signOut: async () => {
      setDemoMode(false);
      if (user) await signOutUser();
    },
    getIdToken: () => {
      if (demoMode) throw new Error("A API não está disponível na sessão demonstrativa.");
      return getIdToken(user);
    }
  }), [user, demoMode, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}
