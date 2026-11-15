import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./transactionsService.js";

export const listTransactions = asyncHandler(async (req, res) => {
  res.json({ transactions: await service.list(req.user.uid, req.query.accountId) });
});

export const createTransaction = asyncHandler(async (req, res) => {
  const transaction = await service.create(req.user.uid, req.body);
  res.status(201).json({ transaction });
});

export const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await service.update(req.user.uid, req.params.transactionId, req.body);
  res.json({ transaction });
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  await service.remove(req.user.uid, req.params.transactionId);
  res.status(204).end();
});
