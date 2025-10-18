import express from "express";
import pool from "../db/index.js";
import { nf2Fields } from "../utils/fields.js";
import { createInsertRoute } from "../utils/routeUtils.js";

const router = new express.Router();

router.get("/truncate", async (req, res) => {
  try {
    for (const k of Object.keys(nf2Fields)) {
      await pool.query(`TRUNCATE TABLE nf2.${k} RESTART IDENTITY CASCADE;`);
    }

    res.status(200).json({});
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.get("/allOrders", async (req, res) => {
  try {
    //EXPLAIN ANALYZE
    const sql = `SELECT oi.order_id AS order_id, first_name AS customer_first_name, 
    last_name AS customer_last_name, email AS customer_email, order_date, payment_method,
    payment_amount, payment_fee, delivery_method, delivery_fee, delivery_region,
    delivery_city, delivery_street, delivery_house, delivery_apartment, delivery_date,
    delivery_status, product_name, category_name, supplier_name, warehouse_region,
    warehouse_city, warehouse_street, warehouse_building, warehouse_apartment, quantity, price 
    FROM nf2.order_items oi 
      JOIN nf2.orders o ON oi.order_id = o.id
      JOIN nf2.customers c ON o.customer_id = c.id
      JOIN nf2.products_stock p ON oi.product_id = p.id
    ORDER BY order_id, product_name, supplier_name, warehouse_region;`;
    const startTime = process.hrtime.bigint(); // High-resolution time start

    const result = await pool.query(sql);

    const endTime = process.hrtime.bigint(); // High-resolution time end
    const durationMs = Number(endTime - startTime) / 1_000_000; // Duration in milliseconds

    console.log(`\nNF2 Orders: Select query executed in ${durationMs} ms`);

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
      FROM nf2.supplier_contacts
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
    FROM nf2.products_stock ps
    LEFT JOIN supplier_contacts_agg sca ON sca.supplier_name = ps.supplier_name
    ORDER BY ps.id;`;

    const result = await pool.query(sql);

    const endTime = process.hrtime.bigint(); // High-resolution time end
    const durationMs = Number(endTime - startTime) / 1_000_000; // Duration in milliseconds

    console.log(
      `\nNF2 Products_stock: Select query executed in ${durationMs} ms`
    );

    res.json({
      durationMs,
      rows: result.rows,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// створюю для кожної таблиці окремий ендпоінт для додавання записів
Object.keys(nf2Fields).forEach((key) => {
  router.post(
    `/${key}`,
    createInsertRoute(
      pool,
      "nf2",
      key,
      nf2Fields[key].filter((f) => f !== "id")
    )
  );
});

export default router;
