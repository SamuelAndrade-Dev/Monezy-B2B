import assert from "node:assert/strict";
import test from "node:test";
import { AppError } from "../src/utils/AppError.js";
import { createTransactionsService } from "../src/modules/transactions/transactionsService.js";

function createHarness() {
  const calls = [];
  const accountsRepository = {
    async getUserProfile(uid) {
      return { uid, companyId: "company-1" };
    },
    async getCompanyAccount(companyId, accountId) {
      if (companyId !== "company-1" || accountId !== "account-1") {
        throw new AppError(404, "ACCOUNT_NOT_FOUND", "Conta empresarial não encontrada.");
      }
      return { id: accountId };
    }
  };
  const repository = {
    async create(...args) {
      calls.push(args);
      return { id: "transaction-1", ...args[2] };
    },
    async update(...args) {
      calls.push(args);
      return { id: args[2], ...args[3] };
    },
    async remove(...args) {
      calls.push(args);
    },
    async list(...args) {
      calls.push(args);
      return [];
    }
  };
  return {
    calls,
    service: createTransactionsService({ accountsRepository, repository })
  };
}

test("creates a simulated expense with normalized values and company scope", async () => {
  const { calls, service } = createHarness();
  const result = await service.create("user-1", {
    accountId: "account-1",
    title: "  Material  ",
    amount: 125.5
  });

  assert.equal(result.title, "Material");
  assert.equal(result.category, "Outros");
  assert.deepEqual(calls[0], [
    "company-1",
    "user-1",
    { accountId: "account-1", title: "Material", amount: 125.5, category: "Outros" }
  ]);
});

test("rejects invalid values before attempting to write", async () => {
  const { calls, service } = createHarness();
  await assert.rejects(
    service.create("user-1", { accountId: "account-1", title: " ", amount: 1 }),
    { code: "INVALID_TITLE", status: 400 }
  );
  await assert.rejects(
    service.create("user-1", { accountId: "account-1", title: "Test", amount: 0.001 }),
    { code: "INVALID_AMOUNT", status: 400 }
  );
  assert.equal(calls.length, 0);
});

test("rejects accounts outside the user's company", async () => {
  const { calls, service } = createHarness();
  await assert.rejects(
    service.create("user-1", { accountId: "other-account", title: "Test", amount: 1 }),
    { code: "ACCOUNT_NOT_FOUND", status: 404 }
  );
  assert.equal(calls.length, 0);
});

test("rejects malformed Firestore document identifiers", async () => {
  const { calls, service } = createHarness();
  await assert.rejects(
    service.create("user-1", { accountId: "company-1/accounts/other", title: "Test", amount: 1 }),
    { code: "INVALID_ID", status: 400 }
  );
  assert.equal(calls.length, 0);
});

test("requires at least one valid field when updating", async () => {
  const { calls, service } = createHarness();
  await assert.rejects(
    service.update("user-1", "transaction-1", {}),
    { code: "EMPTY_UPDATE", status: 400 }
  );
  await assert.rejects(
    service.update("user-1", "transaction-1", { category: " " }),
    { code: "INVALID_CATEGORY", status: 400 }
  );
  assert.equal(calls.length, 0);
});
