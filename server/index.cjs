require("dotenv").config();
const { createPool } = require("./db/pool.cjs");
const { createApp } = require("./app.cjs");

const port = Number(process.env.PORT) || 3000;
const pool = createPool();
const app = createApp(pool);
const server = app.listen(port, () => {
  console.log(`Network Protocol Explorer listening on port ${port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received; closing server.`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
