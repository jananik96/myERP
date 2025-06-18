import express from "express";
import { db_pool } from "../../db-pool.js";

const boqsRouter = express.Router();

// ✅ GET all BOQs
boqsRouter.get("/", async (req, res) => {
  let client;
  try {
    client = await db_pool.connect();
    console.log("✅ Connected to database");

    const result = await client.query("SELECT * FROM cerpschema.boqs");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error executing query:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) client.release();
  }
});

// ✅ GET BOQ by ID
boqsRouter.get("/:aid", async (req, res) => {
  let client;
  try {
    client = await db_pool.connect();
    console.log("✅ Connected to database");

    const result = await client.query(
      "SELECT * FROM cerpschema.boqs WHERE boq_id = $1",
      [req.params.aid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "BOQ not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error executing query:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) client.release();
  }
});

// ✅ POST Create BOQ
boqsRouter.post("/add", async (req, res) => {
  let client;
  // Accept either req.body.newnorms or req.body directly
  const data = req.body.newnorms || req.body;

  console.log("📥 Received BOQ Data:", data);

  if (!data.title || !data.prepared_date || !data.remarks) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    client = await db_pool.connect();

    const result = await client.query(
      `INSERT INTO cerpschema.boqs (title, prepared_date, remarks)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.title, data.prepared_date, data.remarks]
    );

    console.log("✅ Inserted BOQ:", result.rows[0]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("❌ Error executing query:", err.stack);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  } finally {
    if (client) client.release();
  }
});

// ✅ PUT Update BOQ
boqsRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  let { title, prepared_date, remarks } = req.body;
  let client;

  console.log("🛠️ PUT /api/boqs/:id called");
  console.log("ID:", id);
  console.log("Incoming data:", { title, prepared_date, remarks });

  // Replace undefined with null
  title = title || null;
  prepared_date = prepared_date || null;
  remarks = remarks || null;

  if (!id) {
    return res.status(400).json({ error: "Invalid or missing BOQ ID" });
  }

  try {
    client = await db_pool.connect();

    const result = await client.query(
      `UPDATE cerpschema.boqs 
       SET title = $1, prepared_date = $2, remarks = $3 
       WHERE boq_id = $4 
       RETURNING *`,
      [title, prepared_date, remarks, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "BOQ not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error executing query:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) client.release();
  }
});

// ✅ DELETE BOQ by ID
boqsRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;
  let client;

  console.log(`🗑️ DELETE /api/boqs/${id} called`);

  try {
    client = await db_pool.connect();

    const result = await client.query(
      "DELETE FROM cerpschema.boqs WHERE boq_id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "BOQ not found" });
    }

    console.log("✅ Deleted BOQ:", result.rows[0]);

    return res.status(200).json({
      message: "BOQ deleted successfully",
      deletedBOQ: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error executing DELETE query:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) client.release();
  }
});

export default boqsRouter;
