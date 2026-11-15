import cors from "cors";
import express from "express";
import accountsRoutes from "./modules/accounts/accountsRoutes.js";
import transactionsRoutes from "./modules/transactions/transactionsRoutes.js";
import { verifyIdToken } from "./modules/auth/authService.js";
import { createRequireAuth } from "./middlewares/requireAuth.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { AppError } from "./utils/AppError.js";
import { getServerConfig } from "./config/env.js";

export function createApp({
  verifyToken = verifyIdToken,
  accountRoutes = accountsRoutes,
  transactionRoutes = transactionsRoutes,
  corsOrigins = getServerConfig().corsOrigins
} = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.use(cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) return callback(null, true);
      return callback(new AppError(403, "ORIGIN_NOT_ALLOWED", "Origem não autorizada."));
    }
  }));
  app.use(express.json({ limit: "100kb" }));
  app.get("/health", (req, res) => res.json({ status: "ok" }));
  app.use("/api/v1", createRequireAuth(verifyToken));
  app.use("/api/v1/accounts", accountRoutes);
  app.use("/api/v1/transactions", transactionRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
