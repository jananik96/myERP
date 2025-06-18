import express from "express";
import { db_pool } from "../../db-pool.js";

const boqcatagoryRouter = express.Router();

// GET all BOQ categories
boqcatagoryRouter.get("/", async (req, res) => {
  let client;
  try {
    client = await db_pool.connect();
    const result = await client.query("SELECT * FROM cerpschema.boq_categories ORDER BY boq_category_id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching BOQ categories:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) client.release();
  }
});

// GET single category by ID
boqcatagoryRouter.get("/:id", async (req, res) => {
  let client;
  try {
    client = await db_pool.connect();
    const { id } = req.params;
    const result = await client.query(
      "SELECT * FROM cerpschema.boq_categories WHERE boq_category_id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "BOQ Category not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching BOQ category by ID:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) client.release();
  }
});

boqcatagoryRouter.post("/add", async (req, res) => {
  let client;
  const data = req.body.newnorms || req.body;

  console.log("📥 Received BOQ Category Data:", data);

  const { category_name, description } = data;

  if (!category_name || !description) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    client = await db_pool.connect();
    const result = await client.query(
      `INSERT INTO cerpschema.boq_categories (category_name, description)
       VALUES ($1, $2) RETURNING *`,
      [category_name, description]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("❌ Error executing query:", err.stack);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  } finally {
    if (client) client.release();
  }
});


// PUT update category
boqcatagoryRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { category_name, description } = req.body;

  if (!category_name || !description) {
    return res.status(400).json({ error: "category_name and description are required" });
  }

  let client;
  try {
    client = await db_pool.connect();
    const result = await client.query(
      `UPDATE cerpschema.boq_categories
       SET category_name = $1, description = $2
       WHERE boq_category_id = $3
       RETURNING *`,
      [category_name, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "BOQ Category not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating BOQ category:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) client.release();
  }
});

// DELETE category
boqcatagoryRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;
  let client;
  try {
    client = await db_pool.connect();
    const result = await client.query(
      "DELETE FROM cerpschema.boq_categories WHERE boq_category_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "BOQ Category not found" });
    }

    res.json({ message: "BOQ Category deleted successfully", deleted: result.rows[0] });
  } catch (err) {
    console.error("Error deleting BOQ category:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) client.release();
  }
});

export default boqcatagoryRouter;
