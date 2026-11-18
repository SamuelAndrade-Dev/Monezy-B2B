import { AppError } from "../utils/AppError.js";

const invalidTokenCodes = new Set([
  "auth/argument-error",
  "auth/id-token-expired",
  "auth/id-token-revoked",
  "auth/invalid-id-token",
  "auth/invalid-credential",
  "auth/user-disabled"
]);

export function createRequireAuth(verifyIdToken) {
  return async (req, res, next) => {
    const authorization = req.get("authorization") || "";
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    if (!match) return next(new AppError(401, "UNAUTHENTICATED", "Token de autenticação obrigatório."));

    try {
      req.user = await verifyIdToken(match[1]);
      return next();
    } catch (error) {
      if (error.code === "FIREBASE_NOT_CONFIGURED") return next(error);
      if (invalidTokenCodes.has(error.code)) {
        return next(new AppError(401, "INVALID_TOKEN", "Token de autenticação inválido ou expirado."));
      }
      return next(error);
    }
  };
}
