import { create } from "zustand";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { watchTransactions, watchAccount, ensureAccount } from "../services/transactions";

let stopAuth = null;
let stopTransactions = null;
let stopAccount = null;
const stopData = () => {
  stopTransactions?.(); stopAccount?.();
  stopTransactions = null; stopAccount = null;
};
const getSummary = (transactions, account) => {
  const limitTotal = Math.max(0, Number(account?.limitTotal) || 0);
  const used = transactions.reduce((sum, tx) =>
    sum + (tx.type === "credit" ? -Number(tx.amount || 0) : Number(tx.amount || 0)), 0);
  const utilized = Math.max(0, Math.round(used * 100) / 100);
  return { limitTotal, utilized, available: Math.max(0, limitTotal - utilized),
    percentage: limitTotal > 0 ? Math.min(100, utilized / limitTotal * 100) : 0 };
};
export const useAppStore = create((set, get) => ({
  user: null, authLoading: true, loading: false, error: null,
  transactions: [], account: null, summary: getSummary([], null),
  clearError: () => set({ error: null }),
  start: () => {
    if (stopAuth) return;
    if (!auth) { set({ authLoading: false, error: "Firebase não configurado." }); return; }
    stopAuth = onAuthStateChanged(auth, async user => {
      stopData();
      set({ user, authLoading: false, loading: !!user, transactions: [], account: null,
        summary: getSummary([], null), error: null });
      if (!user) return;
      try {
        await ensureAccount(user.uid);
        if (get().user?.uid !== user.uid) return;
        stopAccount = watchAccount(user.uid, account => set(state => ({
          account, summary: getSummary(state.transactions, account), loading: false
        })), error => set({ error: error.message, loading: false }));
        stopTransactions = watchTransactions(user.uid, transactions => set(state => ({
          transactions, summary: getSummary(transactions, state.account), loading: false
        })), error => set({ error: error.message, loading: false }));
      } catch (error) { set({ error: error.message, loading: false }); }
    }, error => set({ error: error.message, authLoading: false }));
  },
  stop: () => { stopData(); stopAuth?.(); stopAuth = null; },
}));
