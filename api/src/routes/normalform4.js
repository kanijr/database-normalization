import express from "express";
import pool from "../db/index.js";
import { nf4Fields } from "../utils/fields.js";
import { createInsertRoute, getQueryExecTime } from "../utils/routeUtils.js";
import nf4Queries from "../selectQueries/nf4.js";

const router = new express.Router();

router.get("/truncate", async (req, res) => {
  try {
    // for (const k of Object.keys(nf4Fields)) {
    //   await pool.query(`TRUNCATE TABLE nf4.${k} RESTART IDENTITY CASCADE;`);
    // }

    for (const key of [
      "order_items",
      "orders",
      "delivery_methods",
      "payment_methods",
      "customers",
      "product_supplier_warehouse",
      "products",
      "categories",
      "supplier_contact_emails",
      "supplier_contact_phones",
      "suppliers",
      "warehouses",
      "addresses",
      "streets",
      "cities",
      "regions",
    ]) {
      await pool.query(`DELETE FROM nf4.${key};`);
    }

    res.status(200).json({});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/orders", async (req, res) => {
  const { limit, customer_id } = req.query;
  try {
    const sql = nf4Queries.getOrders(limit, customer_id);

    const startTime = process.hrtime.bigint(); // High-resolution time start

    const result = await pool.query(sql);

    const endTime = process.hrtime.bigint(); // High-resolution time end
    const durationMs = Number(endTime - startTime) / 1_000_000; // Duration in milliseconds

    console.log(`\nNF4 Orders: Select query executed in ${durationMs} ms`);

    res.json({
      durationInDb: await getQueryExecTime(sql),
      durationMs,
      rows: result.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/productsStock", async (req, res) => {
  const { limit, supplier_id } = req.query;
  try {
    const startTime = process.hrtime.bigint(); // High-resolution time start

    const sql = nf4Queries.getProductsStock(limit, supplier_id);

    const result = await pool.query(sql);

    const endTime = process.hrtime.bigint(); // High-resolution time end
    const durationMs = Number(endTime - startTime) / 1_000_000; // Duration in milliseconds

    console.log(
      `\nNF4 Products_stock: Select query executed in ${durationMs} ms`
    );

    res.json({
      durationInDb: await getQueryExecTime(sql),
      durationMs,
      rows: result.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// створюю для кожної таблиці окремий ендпоінт для додавання записів
Object.keys(nf4Fields).forEach((key) => {
  router.post(`/${key}`, createInsertRoute("nf4", key, nf4Fields[key]));
});

export default router;
