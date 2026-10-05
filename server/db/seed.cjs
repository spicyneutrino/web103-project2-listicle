const { CREATE_PROTOCOLS_TABLE, UPSERT_PROTOCOL } = require("./schema.cjs");

async function seedDatabase(pool, protocols) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(CREATE_PROTOCOLS_TABLE);
    for (const protocol of protocols) {
      await client.query(UPSERT_PROTOCOL, [
        protocol.id,
        protocol.slug,
        protocol.name,
        protocol.fullName,
        protocol.layer,
        protocol.transport,
        protocol.ports,
        protocol.purpose,
        protocol.description,
        JSON.stringify(protocol.useCases),
        protocol.example,
        protocol.image,
      ]);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { seedDatabase };
