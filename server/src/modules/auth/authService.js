import { adminAuth, firebaseAdminConfigured } from "../../config/firebaseAdmin.js";
import { AppError } from "../../utils/AppError.js";

export async function verifyIdToken(token) {
  if (!firebaseAdminConfigured || !adminAuth) {
    throw new AppError(503, "FIREBASE_NOT_CONFIGURED", "Firebase Admin não está configurado no servidor.");
  }
  return adminAuth.verifyIdToken(token);
}
