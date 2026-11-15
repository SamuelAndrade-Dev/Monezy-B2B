import "dotenv/config";
import { createApp } from "./app.js";
import { getServerConfig } from "./config/env.js";

const { port } = getServerConfig();
const app = createApp();

app.listen(port, "0.0.0.0", () => {
  console.log(`Monezy B2B API disponível na porta ${port}.`);
});
