import * as defaultRepository from "./accountsRepository.js";
import { AppError } from "../../utils/AppError.js";

export function createAccountsService({ repository = defaultRepository } = {}) {
  async function listAccounts(uid) {
    const profile = await repository.getUserProfile(uid);
    const accounts = await repository.listCompanyAccounts(profile.companyId);
    for (const account of accounts) {
      if (
        !Number.isFinite(account.creditLimit) || account.creditLimit < 0 ||
        !Number.isFinite(account.usedLimit) || account.usedLimit < 0 ||
        account.usedLimit > account.creditLimit
      ) {
        throw new AppError(409, "INVALID_ACCOUNT_LIMIT", "Os limites de uma conta estão inconsistentes.");
      }
    }
    return accounts;
  }

  async function getAccountLimits(uid, accountId) {
    const profile = await repository.getUserProfile(uid);
    const account = await repository.getCompanyAccount(profile.companyId, accountId);
    const totalLimit = Number(account.creditLimit);
    const usedLimit = Number(account.usedLimit || 0);
    if (!Number.isFinite(totalLimit) || totalLimit < 0 || !Number.isFinite(usedLimit) || usedLimit < 0 || usedLimit > totalLimit) {
      throw new AppError(409, "INVALID_ACCOUNT_LIMIT", "Os limites da conta estão inconsistentes.");
    }
    return {
      accountId: account.id,
      totalLimit,
      usedLimit,
      availableLimit: (Math.round(totalLimit * 100) - Math.round(usedLimit * 100)) / 100,
      currency: account.currency || "BRL"
    };
  }

  return { listAccounts, getAccountLimits };
}

const service = createAccountsService();
export const listAccounts = service.listAccounts;
export const getAccountLimits = service.getAccountLimits;
