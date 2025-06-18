import express from "express";
import { db_pool } from "../../db-pool.js";

const boqitemRouter = express.Router();

// ✅ GET all BOQ items 
boqitemRouter.get("/", async (req, res) => {
  let client;
  try {
    client = await db_pool.connect();
    console.log("✅ Connected to database");

     const result = await client.query(`SELECT * FROM cerpschema.boq_items ORDER BY boq_item_id ASC`);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error executing query:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) client.release();
  }
});

// ✅ GET BOQ Item by ID
boqitemRouter.get("/:aid", async (req, res) => {
  let client;
  try {
    client = await db_pool.connect();
    console.log("✅ Connected to database");

    const result = await client.query(
      "SELECT * FROM cerpschema.boq_items  WHERE boq_item_id = $1",
      [req.params.aid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "BOQ  item not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error executing query:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) client.release();
  }
});
 

// ✅ POST create new BOQ item
boqitemRouter.post("/", async (req, res) => {
  const {
    boq_id,
    boq_category_id,
    norm_id,
    unit,
    quantity,
    wastage = 0, // default wastage to 0 if not provided
    unit_price,
  } = req.body;

  try {
    //const amount = parseFloat(quantity)  * parseFloat(unit_price);
   const amount = parseFloat(quantity) * parseFloat(unit_price); // calculate amount here


    const created_at = new Date();
    const updated_at = new Date();

    const client = await db_pool.connect();

    const result = await client.query(
      `INSERT INTO cerpschema.boq_items
       (boq_id, boq_category_id, norm_id, unit, quantity, wastage, unit_price, "Amount", created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        boq_id,
        boq_category_id,
        norm_id,
        unit,
        quantity,
        wastage,
        unit_price,
        amount,
        created_at,
        updated_at,
      ]
    );

    client.release();

    const item = result.rows[0];
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ success: false, error: "Database Error" });
  }
});



// ✅ PUT Update BOQ
boqitemRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  let {
    boq_id,
    boq_category_id,
    norm_id,
    unit,
    quantity,
    wastage,
    unit_price,
    created_at,
    updated_at,
  } = req.body;

  let client;

  console.log("🛠️ PUT /api/boqitem/:id called");

  boq_id = boq_id || null;
  boq_category_id = boq_category_id || null;
  norm_id = norm_id || null;
  unit = unit || null;
  quantity = quantity || 0;
  wastage = wastage || 0;
  unit_price = unit_price || 0;

  //const amount = parseFloat(quantity) * parseFloat(unit_price); // ✅ Calculate here
  const amount = parseFloat(quantity) * parseFloat(unit_price); // recalculate before query

  created_at = created_at || new Date();
  updated_at = new Date(); // always update this on change

  if (!id) {
    return res.status(400).json({ error: "Invalid or missing BOQ Item ID" });
  }

  try {
    client = await db_pool.connect();

    const result = await client.query(
      `UPDATE cerpschema.boq_items
       SET boq_id = $1,
           boq_category_id = $2,
           norm_id = $3,
           unit = $4,
           quantity = $5,
           wastage = $6,
           unit_price = $7,
           "Amount" = $8,
           created_at = $9,
           updated_at = $10
       WHERE boq_item_id = $11
       RETURNING *;`,
      [
        boq_id,
        boq_category_id,
        norm_id,
        unit,
        quantity,
        wastage,
        unit_price,
        amount,
        created_at,
        updated_at,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "BOQ item not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error executing query:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) client.release();
  }
});




// ✅ Delete BOQ item
boqitemRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const client = await db_pool.connect();
    const result = await client.query(
      `DELETE FROM cerpschema.boq_items WHERE boq_item_id = $1 RETURNING *`,
      [id]
    );
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ success: true, message: "Deleted", deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});



export default boqitemRouter;
