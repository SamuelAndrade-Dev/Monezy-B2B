import { AppError } from "../../utils/AppError.js";
import * as defaultAccountsRepository from "../accounts/accountsRepository.js";
import * as defaultRepository from "./transactionsRepository.js";
import { validateFirestoreId } from "../../utils/validateFirestoreId.js";

function validateTitle(title) {
  if (typeof title !== "string" || !title.trim() || title.trim().length > 120) {
    throw new AppError(400, "INVALID_TITLE", "A descrição é obrigatória e deve ter até 120 caracteres.");
  }
  return title.trim();
}

function validateAmount(amount) {
  if (typeof amount !== "number") {
    throw new AppError(400, "INVALID_AMOUNT", "O valor deve ser enviado como número.");
  }
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0 || Math.round(value * 100) !== value * 100) {
    throw new AppError(400, "INVALID_AMOUNT", "O valor deve ser positivo e ter no máximo duas casas decimais.");
  }
  return value;
}

export function createTransactionsService({
  accountsRepository = defaultAccountsRepository,
  repository = defaultRepository
} = {}) {
  async function list(uid, accountId) {
    const profile = await accountsRepository.getUserProfile(uid);
    if (accountId) {
      validateFirestoreId(accountId, "Conta");
      await accountsRepository.getCompanyAccount(profile.companyId, accountId);
    }
    return repository.list(profile.companyId, accountId);
  }

  async function create(uid, body = {}) {
    const profile = await accountsRepository.getUserProfile(uid);
    if (typeof body.accountId !== "string" || !body.accountId.trim()) {
      throw new AppError(400, "ACCOUNT_REQUIRED", "Informe a conta empresarial da movimentação.");
    }
    validateFirestoreId(body.accountId, "Conta");
    await accountsRepository.getCompanyAccount(profile.companyId, body.accountId);
    return repository.create(profile.companyId, uid, {
      accountId: body.accountId,
      title: validateTitle(body.title),
      amount: validateAmount(body.amount),
      category: typeof body.category === "string" && body.category.trim()
        ? body.category.trim().slice(0, 60)
        : "Outros"
    });
  }

  async function update(uid, transactionId, body = {}) {
    const profile = await accountsRepository.getUserProfile(uid);
    validateFirestoreId(transactionId, "Movimentação");
    const changes = {};
    if (Object.hasOwn(body, "title")) changes.title = validateTitle(body.title);
    if (Object.hasOwn(body, "amount")) changes.amount = validateAmount(body.amount);
    if (Object.hasOwn(body, "category")) {
      if (typeof body.category !== "string" || !body.category.trim()) {
        throw new AppError(400, "INVALID_CATEGORY", "A categoria não pode ser vazia.");
      }
      changes.category = body.category.trim().slice(0, 60);
    }
    if (Object.keys(changes).length === 0) {
      throw new AppError(400, "EMPTY_UPDATE", "Informe ao menos um campo para atualizar.");
    }
    return repository.update(profile.companyId, uid, transactionId, changes);
  }

  async function remove(uid, transactionId) {
    const profile = await accountsRepository.getUserProfile(uid);
    validateFirestoreId(transactionId, "Movimentação");
    await repository.remove(profile.companyId, transactionId);
  }

  return { list, create, update, remove };
}

const service = createTransactionsService();
export const list = service.list;
export const create = service.create;
export const update = service.update;
export const remove = service.remove;
