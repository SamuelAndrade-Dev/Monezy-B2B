const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function apiRequest(path, { method = "GET", token, body } = {}) {
  if (!API_BASE_URL) {
    throw new Error("A API não está configurada. Defina EXPO_PUBLIC_API_URL e reinicie o Expo.");
  }
  if (!token) throw new Error("Sua sessão expirou. Entre novamente para continuar.");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  if (response.status === 204) return null;
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      payload?.error?.message || `A API respondeu com status ${response.status}.`,
      response.status,
      payload?.error?.code
    );
  }
  return payload;
}
