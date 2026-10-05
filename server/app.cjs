const express = require("express");
const path = require("node:path");
const { makeProtocolRouter } = require("./routes/protocols.cjs");

function createApp(pool, clientDirectory = path.resolve(__dirname, "../client")) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json());
  app.use("/vendor", express.static(path.resolve(__dirname, "../node_modules/@picocss/pico/css")));

  app.get("/api/health", async (_req, res) => {
    try {
      await pool.query("SELECT 1");
      res.json({ status: "ok", database: "connected" });
    } catch (_error) {
      res.status(503).json({ status: "error", database: "unavailable" });
    }
  });
  app.use("/api/protocols", makeProtocolRouter(pool));

  app.use(express.static(clientDirectory, { index: false }));
  app.get("/", (_req, res) => res.sendFile(path.join(clientDirectory, "index.html")));
  app.get("/protocols/:slug", (_req, res) => res.sendFile(path.join(clientDirectory, "index.html")));

  app.use("/api", (_req, res) => res.status(404).json({ error: "API route not found" }));
  app.use((_req, res) => res.status(404).send("Page not found"));
  app.use((error, _req, res, _next) => {
    console.error("Request failed:", error.message);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

module.exports = { createApp };
