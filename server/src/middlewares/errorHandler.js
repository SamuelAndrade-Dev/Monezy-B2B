import { AppError } from "../utils/AppError.js";

export function notFoundHandler(req, res, next) {
  next(new AppError(404, "NOT_FOUND", "Endpoint não encontrado."));
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const firestoreIndexRequired = error.code === 9 && /query requires an index/i.test(error.message || "");
  const status = error instanceof AppError
    ? error.status
    : error.type === "entity.parse.failed" ? 400 : firestoreIndexRequired ? 503 : 500;
  const code = error instanceof AppError
    ? error.code
    : error.type === "entity.parse.failed"
      ? "INVALID_JSON"
      : firestoreIndexRequired ? "FIRESTORE_INDEX_REQUIRED" : "INTERNAL_ERROR";
  const message = error instanceof AppError
    ? error.message
    : error.type === "entity.parse.failed"
      ? "O corpo JSON da requisição é inválido."
      : firestoreIndexRequired
        ? "O histórico requer um índice composto do Firestore."
        : "Ocorreu um erro interno.";

  if (status >= 500) console.error(error);
  res.status(status).json({ error: { code, message } });
}
