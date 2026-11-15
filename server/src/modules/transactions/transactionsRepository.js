import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../../config/firebaseAdmin.js";
import { AppError } from "../../utils/AppError.js";
import { validateFirestoreId } from "../../utils/validateFirestoreId.js";

function firestore() {
  if (!adminDb) throw new AppError(503, "FIREBASE_NOT_CONFIGURED", "Firestore não está configurado no servidor.");
  return adminDb;
}

function accountRef(companyId, accountId) {
  validateFirestoreId(companyId, "Empresa");
  validateFirestoreId(accountId, "Conta");
  return firestore().collection("companies").doc(companyId).collection("accounts").doc(accountId);
}

function transactionsRef(companyId) {
  validateFirestoreId(companyId, "Empresa");
  return firestore().collection("companies").doc(companyId).collection("transactions");
}

function normalizeTransaction(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate?.().toISOString() || null,
    updatedAt: data.updatedAt?.toDate?.().toISOString() || null
  };
}

export async function list(companyId, accountId) {
  let query = transactionsRef(companyId).orderBy("createdAt", "desc");
  if (accountId) query = query.where("accountId", "==", accountId);
  const snapshot = await query.get();
  return snapshot.docs.map(normalizeTransaction);
}

export async function create(companyId, uid, input) {
  const db = firestore();
  const account = accountRef(companyId, input.accountId);
  const transaction = transactionsRef(companyId).doc();

  await db.runTransaction(async (tx) => {
    const accountSnapshot = await tx.get(account);
    if (!accountSnapshot.exists) throw new AppError(404, "ACCOUNT_NOT_FOUND", "Conta empresarial não encontrada.");
    const total = Number(accountSnapshot.get("creditLimit"));
    const used = Number(accountSnapshot.get("usedLimit") || 0);
    if (!Number.isFinite(total) || total < 0 || !Number.isFinite(used) || used < 0 || Math.round(total * 100) < Math.round(used * 100)) {
      throw new AppError(409, "INVALID_ACCOUNT_LIMIT", "Os limites da conta estão inconsistentes.");
    }
    const totalCents = Math.round(total * 100);
    const usedCents = Math.round(used * 100);
    const amountCents = Math.round(input.amount * 100);
    if (usedCents + amountCents > totalCents) {
      throw new AppError(409, "LIMIT_EXCEEDED", "A movimentação excede o limite disponível.");
    }
    tx.update(account, { usedLimit: (usedCents + amountCents) / 100, updatedAt: FieldValue.serverTimestamp() });
    tx.create(transaction, {
      ...input,
      type: "expense",
      userId: uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
  });
  return { id: transaction.id, ...input, type: "expense", userId: uid };
}

export async function update(companyId, uid, transactionId, changes) {
  validateFirestoreId(transactionId, "Movimentação");
  const db = firestore();
  const transaction = transactionsRef(companyId).doc(transactionId);

  return db.runTransaction(async (tx) => {
    const transactionSnapshot = await tx.get(transaction);
    if (!transactionSnapshot.exists) throw new AppError(404, "TRANSACTION_NOT_FOUND", "Movimentação não encontrada.");
    const previous = transactionSnapshot.data();
    const account = accountRef(companyId, previous.accountId);
    const accountSnapshot = await tx.get(account);
    if (!accountSnapshot.exists) throw new AppError(404, "ACCOUNT_NOT_FOUND", "Conta empresarial não encontrada.");

    const previousAmount = Number(previous.amount);
    const amount = changes.amount ?? previousAmount;
    const used = Number(accountSnapshot.get("usedLimit") || 0);
    const total = Number(accountSnapshot.get("creditLimit"));
    if (
      !Number.isFinite(total) || total < 0 ||
      !Number.isFinite(used) || used < 0 ||
      !Number.isFinite(previousAmount) || previousAmount <= 0 ||
      used > total
    ) {
      throw new AppError(409, "INVALID_ACCOUNT_LIMIT", "Os limites da conta estão inconsistentes.");
    }
    const nextUsedCents = Math.round(used * 100) - Math.round(previousAmount * 100) + Math.round(amount * 100);
    if (nextUsedCents < 0 || nextUsedCents > Math.round(total * 100)) {
      throw new AppError(409, "LIMIT_EXCEEDED", "A alteração excede o limite disponível.");
    }
    const nextUsed = nextUsedCents / 100;

    const updated = {
      ...(changes.title !== undefined ? { title: changes.title } : {}),
      ...(changes.amount !== undefined ? { amount } : {}),
      ...(changes.category !== undefined ? { category: changes.category } : {}),
      updatedAt: FieldValue.serverTimestamp()
    };
    tx.update(account, { usedLimit: nextUsed, updatedAt: FieldValue.serverTimestamp() });
    tx.update(transaction, updated);
    return {
      id: transactionId,
      ...previous,
      ...changes,
      amount,
      userId: previous.userId || uid,
      updatedAt: new Date().toISOString()
    };
  });
}

export async function remove(companyId, transactionId) {
  validateFirestoreId(transactionId, "Movimentação");
  const db = firestore();
  const transaction = transactionsRef(companyId).doc(transactionId);

  await db.runTransaction(async (tx) => {
    const snapshot = await tx.get(transaction);
    if (!snapshot.exists) throw new AppError(404, "TRANSACTION_NOT_FOUND", "Movimentação não encontrada.");
    const previous = snapshot.data();
    const account = accountRef(companyId, previous.accountId);
    const accountSnapshot = await tx.get(account);
    if (!accountSnapshot.exists) throw new AppError(404, "ACCOUNT_NOT_FOUND", "Conta empresarial não encontrada.");
    const used = Number(accountSnapshot.get("usedLimit") || 0);
    const previousAmount = Number(previous.amount);
    if (!Number.isFinite(used) || used < 0 || !Number.isFinite(previousAmount) || previousAmount <= 0 || used < previousAmount) {
      throw new AppError(409, "INVALID_ACCOUNT_LIMIT", "Os limites da conta estão inconsistentes.");
    }
    tx.update(account, {
      usedLimit: Math.round((used - previousAmount) * 100) / 100,
      updatedAt: FieldValue.serverTimestamp()
    });
    tx.delete(transaction);
  });
}
