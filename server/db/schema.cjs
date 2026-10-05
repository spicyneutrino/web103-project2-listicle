const CREATE_PROTOCOLS_TABLE = `
  CREATE TABLE IF NOT EXISTS protocols (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    layer TEXT NOT NULL,
    transport TEXT NOT NULL,
    ports TEXT NOT NULL,
    purpose TEXT NOT NULL,
    description TEXT NOT NULL,
    use_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
    example TEXT NOT NULL,
    image TEXT NOT NULL
  )
`;

const UPSERT_PROTOCOL = `
  INSERT INTO protocols (
    id, slug, name, full_name, layer, transport, ports,
    purpose, description, use_cases, example, image
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12)
  ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    name = EXCLUDED.name,
    full_name = EXCLUDED.full_name,
    layer = EXCLUDED.layer,
    transport = EXCLUDED.transport,
    ports = EXCLUDED.ports,
    purpose = EXCLUDED.purpose,
    description = EXCLUDED.description,
    use_cases = EXCLUDED.use_cases,
    example = EXCLUDED.example,
    image = EXCLUDED.image
`;

const PROTOCOL_COLUMNS = `
  id, slug, name, full_name AS "fullName", layer, transport, ports,
  purpose, description, use_cases AS "useCases", example, image
`;

module.exports = { CREATE_PROTOCOLS_TABLE, UPSERT_PROTOCOL, PROTOCOL_COLUMNS };
