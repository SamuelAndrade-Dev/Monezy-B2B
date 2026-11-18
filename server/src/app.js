import cors from "cors";
import express from "express";
import accountsRoutes from "./modules/accounts/accountsRoutes.js";
import transactionsRoutes from "./modules/transactions/transactionsRoutes.js";
import { verifyIdToken } from "./modules/auth/authService.js";
import { createRequireAuth } from "./middlewares/requireAuth.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { AppError } from "./utils/AppError.js";
import { getServerConfig } from "./config/env.js";

function isAllowedOrigin(origin, corsOrigins) {
  if (corsOrigins.includes(origin)) return true;

  try {
    const requested = new URL(origin);
    if (requested.hostname !== "127.0.0.1" && requested.hostname !== "localhost") return false;
    return corsOrigins.some((allowedOrigin) => {
      const allowed = new URL(allowedOrigin);
      return allowed.protocol === requested.protocol &&
        allowed.port === requested.port &&
        ((allowed.hostname === "localhost" && requested.hostname === "127.0.0.1") ||
          (allowed.hostname === "127.0.0.1" && requested.hostname === "localhost"));
    });
  } catch {
    return false;
  }
}

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
      if (!origin || isAllowedOrigin(origin, corsOrigins)) return callback(null, true);
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
