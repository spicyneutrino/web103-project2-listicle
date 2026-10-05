const { Pool } = require("pg");

function createPool(env = process.env) {
  const connectionString = env.DATABASE_URL;
  // Render's private database endpoint uses a self-signed certificate.
  // External connections keep certificate verification enabled.
  const host = connectionString ? new URL(connectionString).hostname : '';
  const renderPrivateEndpoint = env.RENDER === 'true' && /^dpg-[a-z0-9-]+$/.test(host);
  const requiresSsl = env.PGSSLMODE === "require" || env.NODE_ENV === "production";

  return new Pool({
    ...(connectionString ? { connectionString } : {}),
    ...(requiresSsl ? { ssl: { rejectUnauthorized: !renderPrivateEndpoint } } : {}),
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
}

module.exports = { createPool };
