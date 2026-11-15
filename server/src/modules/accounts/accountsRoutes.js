import { Router } from "express";
import { getAccountLimits, listAccounts } from "./accountsController.js";

const router = Router();
router.get("/", listAccounts);
router.get("/:accountId/limits", getAccountLimits);
export default router;
