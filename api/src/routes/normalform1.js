import express from "express";
import pool from "../db/index.js";
import { nf1Fields } from "../utils/fields.js";
import { createInsertRoute } from "../utils/routeUtils.js";

const router = new express.Router();

router.get("/truncate", async (req, res) => {
  try {
    for (const key of Object.keys(nf1Fields)) {
      await pool.query(`TRUNCATE TABLE nf1.${key} RESTART IDENTITY CASCADE;`);
    }

    res.status(200).json({});
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.get("/allOrders", async (req, res) => {
  try {
    const sql = `SELECT * FROM nf1.orders 
    ORDER BY order_id, product_name, supplier_name, warehouse_region;`;

    const startTime = process.hrtime.bigint(); // High-resolution time start

    const result = await pool.query(sql);

    const endTime = process.hrtime.bigint(); // High-resolution time end
    const durationMs = Number(endTime - startTime) / 1_000_000; // Duration in milliseconds

    console.log(`\nNF1 Orders: Select query executed in ${durationMs} ms`);

    res.json({
      durationMs,
      rows: result.rows,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/allProducts_stock", async (req, res) => {
  try {
    const startTime = process.hrtime.bigint(); // High-resolution time start

    const sql = `WITH supplier_contacts_agg AS (
      SELECT 
          supplier_name,
          STRING_AGG(DISTINCT phone, ', ') AS supplier_phones,
          STRING_AGG(DISTINCT email, ', ') AS supplier_emails
      FROM nf1.supplier_contacts
      GROUP BY supplier_name
    )
    SELECT 
        ps.id AS product_id,
        product_name, category_name,
        ps.supplier_name,
        sca.supplier_phones, 
        sca.supplier_emails,
        warehouse_region, warehouse_city,
        warehouse_street, warehouse_building,
        warehouse_apartment, price
    FROM nf1.products_stock ps
    LEFT JOIN supplier_contacts_agg sca ON sca.supplier_name = ps.supplier_name
    ORDER BY ps.id;`;

    const result = await pool.query(sql);

    const endTime = process.hrtime.bigint(); // High-resolution time end
    const durationMs = Number(endTime - startTime) / 1_000_000; // Duration in milliseconds

    console.log(
      `\nNF1 Products_stock: Select query executed in ${durationMs} ms`
    );

    res.json({
      durationMs,
      rows: result.rows,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Створюю для кожної таблиці окремий ендпоінт для додавання записів
Object.keys(nf1Fields).forEach((key) => {
  router.post(
    `/${key}`,
    createInsertRoute(
      pool,
      "nf1",
      key,
      nf1Fields[key].filter((f) => f !== "id")
    )
  );
});

export default router;
