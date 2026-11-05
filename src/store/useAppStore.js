import { create } from "zustand";

export const useAppStore = create((set) => ({
  transactions: [],
  loading: false,
  setTransactions: (transactions) => set({ transactions }),
  setLoading: (loading) => set({ loading })
}));
