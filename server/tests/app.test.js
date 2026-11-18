import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createServer } from "node:http";
import express from "express";
import { createApp } from "../src/app.js";

let server;
let baseUrl;
const accountRouter = express.Router();
const transactionRouter = express.Router();
accountRouter.get("/", (req, res) => res.json({ accounts: [{ id: "acct-1", companyId: req.user.companyId }] }));
transactionRouter.post("/", (req, res) => res.status(201).json({ transaction: req.body }));

before(async () => {
  const app = createApp({
    verifyToken: async (token) => {
      if (token === "revoked-test-token") {
        const error = new Error("revoked token");
        error.code = "auth/id-token-revoked";
        throw error;
      }
      if (token === "disabled-test-token") {
        const error = new Error("disabled user");
        error.code = "auth/user-disabled";
        throw error;
      }
      if (token !== "valid-test-token") {
        const error = new Error("invalid token");
        error.code = "auth/invalid-id-token";
        throw error;
      }
      return { uid: "user-1", companyId: "company-1" };
    },
    accountRoutes: accountRouter,
    transactionRoutes: transactionRouter,
    corsOrigins: ["http://localhost:8081"]
  });
  server = createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test("health endpoint works without an authentication token", async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("business endpoints reject requests without a token", async () => {
  const response = await fetch(`${baseUrl}/api/v1/accounts`);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error.code, "UNAUTHENTICATED");
});

test("business endpoints pass the verified identity to route handlers", async () => {
  const response = await fetch(`${baseUrl}/api/v1/accounts`, {
    headers: { Authorization: "Bearer valid-test-token" }
  });
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).accounts[0], {
    id: "acct-1",
    companyId: "company-1"
  });
});

test("invalid Firebase tokens return a structured error", async () => {
  const response = await fetch(`${baseUrl}/api/v1/accounts`, {
    headers: { Authorization: "Bearer expired-token" }
  });
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error.code, "INVALID_TOKEN");
});

test("revoked Firebase tokens return a structured error", async () => {
  const response = await fetch(`${baseUrl}/api/v1/accounts`, {
    headers: { Authorization: "Bearer revoked-test-token" }
  });
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error.code, "INVALID_TOKEN");
});

test("disabled Firebase users are rejected as unauthenticated", async () => {
  const response = await fetch(`${baseUrl}/api/v1/accounts`, {
    headers: { Authorization: "Bearer disabled-test-token" }
  });
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error.code, "INVALID_TOKEN");
});

test("invalid JSON requests receive a client error", async () => {
  const response = await fetch(`${baseUrl}/api/v1/transactions`, {
    method: "POST",
    headers: {
      Authorization: "Bearer valid-test-token",
      "Content-Type": "application/json"
    },
    body: "{invalid"
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "INVALID_JSON");
});
