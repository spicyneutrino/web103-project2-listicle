const express = require("express");
const { PROTOCOL_COLUMNS } = require("../db/schema.cjs");

const SEARCHABLE_ATTRIBUTES = new Set(["name", "layer", "transport", "ports"]);
const COLUMN_BY_ATTRIBUTE = {
  name: "name",
  layer: "layer",
  transport: "transport",
  ports: "ports",
};

function makeProtocolRouter(pool) {
  const router = express.Router();

  router.get("/", async (req, res, next) => {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const attribute = typeof req.query.attribute === "string" ? req.query.attribute : "";
    if (attribute && !SEARCHABLE_ATTRIBUTES.has(attribute)) {
      return res.status(400).json({ error: "attribute must be name, layer, transport, or ports" });
    }

    try {
      let result;
      if (!q) {
        result = await pool.query(`SELECT ${PROTOCOL_COLUMNS} FROM protocols ORDER BY id`);
      } else if (attribute) {
        const column = COLUMN_BY_ATTRIBUTE[attribute];
        result = await pool.query(
          `SELECT ${PROTOCOL_COLUMNS} FROM protocols WHERE ${column} ILIKE $1 ORDER BY id`,
          [`%${q}%`]
        );
      } else {
        result = await pool.query(
          `SELECT ${PROTOCOL_COLUMNS} FROM protocols
           WHERE name ILIKE $1 OR layer ILIKE $1 OR transport ILIKE $1 OR ports ILIKE $1
           ORDER BY id`,
          [`%${q}%`]
        );
      }
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  });

  router.get("/:slug", async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT ${PROTOCOL_COLUMNS} FROM protocols WHERE slug = $1 LIMIT 1`,
        [req.params.slug]
      );
      if (!result.rows[0]) return res.status(404).json({ error: "Protocol not found" });
      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { makeProtocolRouter };
