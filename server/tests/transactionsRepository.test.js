import assert from "node:assert/strict";
import test from "node:test";
import { createTransactionsRepository } from "../src/modules/transactions/transactionsRepository.js";

function createHarness({ creditLimit = 10000, usedLimit = 0, transaction } = {}) {
  const documents = new Map([
    ["companies/company-1/accounts/account-1", { creditLimit, usedLimit }]
  ]);
  if (transaction) {
    documents.set(`companies/company-1/transactions/${transaction.id}`, transaction);
  }
  let generatedId = 0;

  function documentRef(path, id) {
    return {
      id,
      path,
      collection(name) {
        return collectionRef(`${path}/${name}`);
      }
    };
  }

  function collectionRef(path) {
    return {
      doc(id) {
        const documentId = id || `transaction-${++generatedId}`;
        return documentRef(`${path}/${documentId}`, documentId);
      }
    };
  }

  const db = {
    collection: collectionRef,
    async runTransaction(callback) {
      const writes = [];
      const tx = {
        async get(ref) {
          const value = documents.get(ref.path);
          return {
            exists: value !== undefined,
            data: () => value && structuredClone(value),
            get: (field) => value?.[field]
          };
        },
        update(ref, data) {
          writes.push({ type: "update", ref, data });
        },
        create(ref, data) {
          writes.push({ type: "create", ref, data });
        },
        delete(ref) {
          writes.push({ type: "delete", ref });
        }
      };

      const result = await callback(tx);
      for (const write of writes) {
        if (write.type === "update") {
          documents.set(write.ref.path, { ...documents.get(write.ref.path), ...write.data });
        } else if (write.type === "create") {
          documents.set(write.ref.path, write.data);
        } else {
          documents.delete(write.ref.path);
        }
      }
      return result;
    }
  };
  const fieldValue = { serverTimestamp: () => "server-timestamp" };

  return {
    documents,
    repository: createTransactionsRepository({ db, fieldValue }),
    accountPath: "companies/company-1/accounts/account-1"
  };
}

test("creates a transaction and updates the account limit in one transaction", async () => {
  const { documents, repository, accountPath } = createHarness();

  const result = await repository.create("company-1", "user-1", {
    accountId: "account-1",
    title: "Teste",
    amount: 150,
    category: "Outros"
  });

  assert.equal(documents.get(accountPath).usedLimit, 150);
  assert.equal(documents.get(`companies/company-1/transactions/${result.id}`).amount, 150);
});

test("rejects an expense above the available limit without writing either document", async () => {
  const { documents, repository, accountPath } = createHarness({
    creditLimit: 1000,
    usedLimit: 995
  });

  await assert.rejects(repository.create("company-1", "user-1", {
    accountId: "account-1",
    title: "Acima do limite",
    amount: 10,
    category: "Outros"
  }), { status: 409, code: "LIMIT_EXCEEDED" });

  assert.equal(documents.get(accountPath).usedLimit, 995);
  assert.equal(documents.size, 1);
});

test("editing recalculates used limit and deleting restores it", async () => {
  const transaction = {
    id: "transaction-1",
    accountId: "account-1",
    title: "Compra",
    amount: 150,
    type: "expense",
    userId: "user-1"
  };
  const { documents, repository, accountPath } = createHarness({
    usedLimit: 150,
    transaction
  });

  await repository.update("company-1", "user-1", transaction.id, { amount: 200 });
  assert.equal(documents.get(accountPath).usedLimit, 200);
  assert.equal(documents.get(`companies/company-1/transactions/${transaction.id}`).amount, 200);

  await repository.remove("company-1", transaction.id);
  assert.equal(documents.get(accountPath).usedLimit, 0);
  assert.equal(documents.has(`companies/company-1/transactions/${transaction.id}`), false);
});

test("lists account transactions newest first without a composite-index query", async () => {
  const toTimestamp = (value) => ({ toDate: () => new Date(value) });
  const docs = [
    { id: "older", data: () => ({ accountId: "account-1", title: "Older", amount: 10, createdAt: toTimestamp("2026-01-01T10:00:00.000Z") }) },
    { id: "newer", data: () => ({ accountId: "account-1", title: "Newer", amount: 20, createdAt: toTimestamp("2026-01-02T10:00:00.000Z") }) },
    { id: "missing-date", data: () => ({ accountId: "account-1", title: "Missing date", amount: 5 }) }
  ];
  let whereCall;
  const query = {
    where(...args) {
      whereCall = args;
      return this;
    },
    async get() {
      return { docs };
    }
  };
  const db = {
    collection(name) {
      assert.equal(name, "companies");
      return {
        doc(companyId) {
          assert.equal(companyId, "company-1");
          return {
            collection(collectionName) {
              assert.equal(collectionName, "transactions");
              return query;
            }
          };
        }
      };
    }
  };
  const repository = createTransactionsRepository({ db });

  const result = await repository.list("company-1", "account-1");

  assert.deepEqual(whereCall, ["accountId", "==", "account-1"]);
  assert.deepEqual(result.map((transaction) => transaction.id), ["newer", "older"]);
});

test("rejects an edit above the available limit without changing stored values", async () => {
  const transaction = {
    id: "transaction-1",
    accountId: "account-1",
    title: "Compra",
    amount: 100,
    type: "expense",
    userId: "user-1"
  };
  const { documents, repository, accountPath } = createHarness({
    creditLimit: 1000,
    usedLimit: 900,
    transaction
  });

  await assert.rejects(repository.update("company-1", "user-1", transaction.id, { amount: 250 }), {
    status: 409,
    code: "LIMIT_EXCEEDED"
  });

  assert.equal(documents.get(accountPath).usedLimit, 900);
  assert.equal(documents.get(`companies/company-1/transactions/${transaction.id}`).amount, 100);
});
