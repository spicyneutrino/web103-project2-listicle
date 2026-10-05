const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../server/app.cjs");
const { seedDatabase } = require("../server/db/seed.cjs");

async function withServer(pool, run) {
  const server = createApp(pool).listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test("list endpoint returns records and uses parameterized attribute search", async () => {
  const pool = {
    async query(sql, params) {
      assert.match(sql, /name ILIKE \$1/);
      assert.deepEqual(params, ["%dns%"]);
      return { rows: [{ id: 2, slug: "dns", name: "DNS" }] };
    },
  };
  await withServer(pool, async (base) => {
    const response = await fetch(`${base}/api/protocols?q=dns&attribute=name`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [{ id: 2, slug: "dns", name: "DNS" }]);
  });
});

test("invalid search attributes are rejected before querying", async () => {
  const pool = { query: async () => assert.fail("query should not run") };
  await withServer(pool, async (base) => {
    const response = await fetch(`${base}/api/protocols?q=x&attribute=slug`);
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /attribute must be/);
  });
});

test("detail endpoint reports unknown slugs with 404", async () => {
  const pool = {
    async query(sql, params) {
      assert.match(sql, /WHERE slug = \$1/);
      assert.deepEqual(params, ["missing"]);
      return { rows: [] };
    },
  };
  await withServer(pool, async (base) => {
    const response = await fetch(`${base}/api/protocols/missing`);
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: "Protocol not found" });
  });
});

test("health endpoint reports a database failure as unavailable", async () => {
  const pool = { query: async () => { throw new Error("offline"); } };
  await withServer(pool, async (base) => {
    const response = await fetch(`${base}/api/health`);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { status: "error", database: "unavailable" });
  });
});

test("seed writes schema and rows in one transaction", async () => {
  const statements = [];
  let released = false;
  const client = {
    async query(sql, params) {
      statements.push({ sql, params });
      return { rows: [] };
    },
    release() { released = true; },
  };
  await seedDatabase({ connect: async () => client }, [{
    id: 1,
    slug: "http",
    name: "HTTP",
    fullName: "Hypertext Transfer Protocol",
    layer: "Application Layer",
    transport: "TCP",
    ports: "80 / 443",
    purpose: "Web traffic",
    description: "Transfers web content",
    useCases: ["Websites"],
    example: "Browser request",
    image: "/images/http.svg",
  }]);

  assert.equal(statements[0].sql, "BEGIN");
  assert.match(statements[1].sql, /CREATE TABLE IF NOT EXISTS protocols/);
  assert.match(statements[2].sql, /ON CONFLICT \(id\) DO UPDATE/);
  assert.deepEqual(statements[2].params[9], '["Websites"]');
  assert.equal(statements.at(-1).sql, "COMMIT");
  assert.equal(released, true);
});

test("seed rolls back and releases the connection when a write fails", async () => {
  const statements = [];
  let released = false;
  const client = {
    async query(sql) {
      statements.push(sql);
      if (sql.includes("INSERT INTO protocols")) throw new Error("write failed");
      return { rows: [] };
    },
    release() { released = true; },
  };
  const protocol = {
    id: 1,
    slug: "http",
    name: "HTTP",
    fullName: "Hypertext Transfer Protocol",
    layer: "Application Layer",
    transport: "TCP",
    ports: "80 / 443",
    purpose: "Web traffic",
    description: "Transfers web content",
    useCases: [],
    example: "Browser request",
    image: "/images/http.svg",
  };

  await assert.rejects(seedDatabase({ connect: async () => client }, [protocol]), /write failed/);
  assert.equal(statements.at(-1), "ROLLBACK");
  assert.equal(released, true);
});
