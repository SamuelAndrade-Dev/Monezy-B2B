export function getServerConfig(env = process.env) {
  const port = Number(env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT deve ser um inteiro entre 1 e 65535.");
  }
  return {
    port,
    corsOrigins: (env.CORS_ORIGIN || "http://localhost:8081")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  };
}
