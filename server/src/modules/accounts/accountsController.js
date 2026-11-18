import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./accountsService.js";

export const listAccounts = asyncHandler(async (req, res) => {
  res.json({ accounts: await service.listAccounts(req.user.uid) });
});

export const getAccountLimits = asyncHandler(async (req, res) => {
  res.json({ ...(await service.getAccountLimits(req.user.uid, req.params.accountId)) });
});
