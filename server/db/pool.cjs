const { Pool } = require("pg");

function createPool(env = process.env) {
  const connectionString = env.DATABASE_URL;
  const requiresSsl = env.PGSSLMODE === "require" || env.NODE_ENV === "production";

  return new Pool({
    ...(connectionString ? { connectionString } : {}),
    ...(requiresSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
}

module.exports = { createPool };
