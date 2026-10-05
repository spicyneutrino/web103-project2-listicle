require("dotenv").config();
const { createPool } = require("../db/pool.cjs");
const { seedDatabase } = require("../db/seed.cjs");
const protocols = require("./seed-data.cjs");

async function main() {
  const pool = createPool();
  try {
    await seedDatabase(pool, protocols);
    console.log(`Seeded ${protocols.length} protocols.`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Database schema/seed failed:", error.message);
  process.exitCode = 1;
});
