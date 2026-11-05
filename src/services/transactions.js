import {
  addDoc, collection, getDocs, orderBy, query, serverTimestamp
} from "firebase/firestore";
import { assertFirebaseConfigured, db } from "./firebase";

const transactionsCollection = () => collection(db, "transactions");

export async function listTransactions() {
  assertFirebaseConfigured();
  const q = query(transactionsCollection(), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function createTransaction({ title, amount, category = "Outros", type = "expense", uid }) {
  assertFirebaseConfigured();
  if (!title?.trim()) throw new Error("Informe a descrição da movimentação.");
  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    throw new Error("O valor deve ser maior que zero.");
  }
  const doc = await addDoc(transactionsCollection(), {
    title: title.trim(),
    amount: Number(amount),
    category,
    type,
    uid: uid || null,
    createdAt: serverTimestamp()
  });
  return doc.id;
}
