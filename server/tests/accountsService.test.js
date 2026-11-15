import assert from "node:assert/strict";
import test from "node:test";
import { AppError } from "../src/utils/AppError.js";
import { createAccountsService } from "../src/modules/accounts/accountsService.js";

function createService(account) {
  const calls = [];
  const repository = {
    async getUserProfile(uid) {
      return { uid, companyId: "company-1" };
    },
    async listCompanyAccounts(companyId) {
      calls.push(["list", companyId]);
      return [{ id: "account-1", ...account }];
    },
    async getCompanyAccount(companyId, accountId) {
      calls.push(["get", companyId, accountId]);
      return { id: accountId, ...account };
    }
  };
  return { calls, service: createAccountsService({ repository }) };
}

test("lists accounts inside the authenticated company scope", async () => {
  const { calls, service } = createService({ creditLimit: 1000, usedLimit: 250 });
  const accounts = await service.listAccounts("user-1");
  assert.equal(accounts[0].id, "account-1");
  assert.deepEqual(calls, [["list", "company-1"]]);
});

test("calculates account limit values without floating point drift", async () => {
  const { calls, service } = createService({ creditLimit: 100.1, usedLimit: 25.05, currency: "BRL" });
  const limits = await service.getAccountLimits("user-1", "account-1");
  assert.deepEqual(limits, {
    accountId: "account-1",
    totalLimit: 100.1,
    usedLimit: 25.05,
    availableLimit: 75.05,
    currency: "BRL"
  });
  assert.deepEqual(calls, [["get", "company-1", "account-1"]]);
});

test("rejects inconsistent account limits", async () => {
  const { service } = createService({ creditLimit: 100, usedLimit: 101 });
  await assert.rejects(service.listAccounts("user-1"), {
    code: "INVALID_ACCOUNT_LIMIT",
    status: 409
  });
  await assert.rejects(service.getAccountLimits("user-1", "account-1"), {
    code: "INVALID_ACCOUNT_LIMIT",
    status: 409
  });
});
