import {
  collection, doc, setDoc, getDoc, addDoc, updateDoc, deleteDoc,
  onSnapshot, serverTimestamp, writeBatch, Timestamp
} from "firebase/firestore";
import { db, assertFirebaseConfigured } from "./firebase";

function requireUid(uid) {
  assertFirebaseConfigured();
  if (!uid) throw new Error("Faça login para acessar seus dados.");
}
const accountRef = (uid) => doc(db, "users", uid, "accounts", "main");
const txRef = (uid) => collection(db, "users", uid, "transactions");
const amountNumber = (value) => {
  const n = Number(String(value).replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) throw new Error("Informe um valor positivo válido.");
  return Math.round(n * 100) / 100;
};
function parseDate(value) {
  const str = String(value || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) throw new Error("Data deve estar no formato AAAA-MM-DD.");
  const [year, month, day] = str.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day)
    throw new Error("Data inválida.");
  return Timestamp.fromDate(date);
}
function validate(data) {
  if (!data.title?.trim()) throw new Error("Informe uma descrição.");
  return {
    title: data.title.trim(),
    amount: amountNumber(data.amount),
    category: String(data.category || "Outros").trim() || "Outros",
    type: data.type === "credit" ? "credit" : "expense",
    date: parseDate(data.date),
  };
}
export async function createTransaction(uid, data) {
  requireUid(uid);
  return addDoc(txRef(uid), { ...validate(data), createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}
export async function updateTransaction(uid, id, data) {
  requireUid(uid);
  if (!id) throw new Error("Identificador ausente.");
  return updateDoc(doc(txRef(uid), id), { ...validate(data), updatedAt: serverTimestamp() });
}
export async function deleteTransaction(uid, id) {
  requireUid(uid);
  if (!id) throw new Error("Identificador ausente.");
  return deleteDoc(doc(txRef(uid), id));
}
export function watchTransactions(uid, next, fail) {
  requireUid(uid);
  return onSnapshot(txRef(uid), snap => {
    const data = snap.docs.map(item => ({ id: item.id, ...item.data() }));
    data.sort((a,b) => (b.date?.toMillis?.() || 0) - (a.date?.toMillis?.() || 0));
    next(data);
  }, fail);
}
export function watchAccount(uid, next, fail) {
  requireUid(uid);
  return onSnapshot(accountRef(uid), snap => next(snap.exists() ? snap.data() : null), fail);
}
export async function ensureAccount(uid) {
  requireUid(uid);
  const ref = accountRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) await setDoc(ref, { limitTotal: 10000, currency: "BRL", companyId: uid, demo: true, createdAt: serverTimestamp() });
}
export async function seedDemo(uid) {
  requireUid(uid);
  await ensureAccount(uid);
  const batch = writeBatch(db);
  const examples = [
    { title: "Material de escritório", amount: 245.9, category: "Escritório", type: "expense", date: "2026-11-03" },
    { title: "Assinatura de software", amount: 159.0, category: "Tecnologia", type: "expense", date: "2026-11-04" },
    { title: "Transporte empresarial", amount: 89.5, category: "Transporte", type: "expense", date: "2026-11-05" },
  ];
  for (const item of examples) batch.set(doc(txRef(uid)), { ...validate(item), createdAt: serverTimestamp(), updatedAt: serverTimestamp(), demo: true });
  await batch.commit();
}
