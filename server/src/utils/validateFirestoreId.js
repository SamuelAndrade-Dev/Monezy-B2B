import { AppError } from "./AppError.js";

export function validateFirestoreId(value, label) {
  if (typeof value !== "string" || !value.trim() || value.includes("/") || value.length > 1500) {
    throw new AppError(400, "INVALID_ID", `${label} inválido.`);
  }
  return value;
}
