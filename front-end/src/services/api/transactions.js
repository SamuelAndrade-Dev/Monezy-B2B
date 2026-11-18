import { apiRequest } from "./client";

export async function listTransactions(token, accountId) {
  const query = accountId ? `?accountId=${encodeURIComponent(accountId)}` : "";
  const result = await apiRequest(`/transactions${query}`, { token });
  return result.transactions;
}

export async function createTransaction(transaction, token) {
  const result = await apiRequest("/transactions", {
    method: "POST",
    token,
    body: transaction
  });
  return result.transaction;
}

export async function updateTransaction(id, changes, token) {
  const result = await apiRequest(`/transactions/${encodeURIComponent(id)}`, {
    method: "PATCH",
    token,
    body: changes
  });
  return result.transaction;
}

export function deleteTransaction(id, token) {
  return apiRequest(`/transactions/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token
  });
}
