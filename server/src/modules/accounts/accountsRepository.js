import { adminDb } from "../../config/firebaseAdmin.js";
import { AppError } from "../../utils/AppError.js";
import { validateFirestoreId } from "../../utils/validateFirestoreId.js";

function firestore() {
  if (!adminDb) throw new AppError(503, "FIREBASE_NOT_CONFIGURED", "Firestore não está configurado no servidor.");
  return adminDb;
}

export async function getUserProfile(uid) {
  const snapshot = await firestore().collection("users").doc(uid).get();
  if (!snapshot.exists) {
    throw new AppError(403, "COMPANY_ACCESS_REQUIRED", "Este usuário não está vinculado a uma empresa.");
  }
  const profile = snapshot.data();
  if (typeof profile.companyId !== "string" || !profile.companyId.trim() || profile.companyId.includes("/")) {
    throw new AppError(403, "COMPANY_ACCESS_REQUIRED", "Este usuário não está vinculado a uma empresa.");
  }
  return { ...profile, uid };
}

export async function listCompanyAccounts(companyId) {
  validateFirestoreId(companyId, "Empresa");
  const snapshot = await firestore()
    .collection("companies").doc(companyId).collection("accounts").get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || "Conta empresarial",
      creditLimit: Number(data.creditLimit),
      usedLimit: Number(data.usedLimit || 0),
      currency: data.currency || "BRL"
    };
  });
}

export async function getCompanyAccount(companyId, accountId) {
  validateFirestoreId(companyId, "Empresa");
  validateFirestoreId(accountId, "Conta");
  const snapshot = await firestore()
    .collection("companies").doc(companyId).collection("accounts").doc(accountId).get();
  if (!snapshot.exists) throw new AppError(404, "ACCOUNT_NOT_FOUND", "Conta empresarial não encontrada.");
  return { id: snapshot.id, ...snapshot.data() };
}
