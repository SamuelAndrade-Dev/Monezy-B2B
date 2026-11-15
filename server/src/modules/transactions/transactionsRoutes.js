import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction
} from "./transactionsController.js";

const router = Router();
router.get("/", listTransactions);
router.post("/", createTransaction);
router.patch("/:transactionId", updateTransaction);
router.delete("/:transactionId", deleteTransaction);
export default router;
