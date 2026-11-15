import { apiRequest } from "./client";

export async function listAccounts(token) {
  const result = await apiRequest("/accounts", { token });
  return result.accounts;
}

export async function getAccountLimits(accountId, token) {
  return apiRequest(`/accounts/${encodeURIComponent(accountId)}/limits`, { token });
}
