import express from "express";
import createClient from "../db/index.js";
import { nf3Fields } from "../utils/fields.js";
import { createInsertRoute } from "../utils/routeUtils.js";
import nf3Queries from "../selectQueries/nf3.js";

const router = new express.Router();

router.get("/truncate", async (req, res) => {
  const client = createClient();
  try {
    await client.connect();
    for (const key of Object.keys(nf3Fields)) {
      await client.query(`TRUNCATE TABLE nf3.${key} RESTART IDENTITY CASCADE;`);
    }

    res.status(200).json({});
  } catch (err) {
    res.status(400).json({ error: err.message });
  } finally {
    client.end();
  }
});

router.get("/allOrders", async (req, res) => {
  const client = createClient();
  const { limit } = req.query;
  try {
    const sql = nf3Queries.getAllOrders(limit);

    await client.connect();

    const startTime = process.hrtime.bigint(); // High-resolution time start

    const result = await client.query(sql);

    const endTime = process.hrtime.bigint(); // High-resolution time end
    const durationMs = Number(endTime - startTime) / 1_000_000; // Duration in milliseconds

    console.log(`\nNF3 Orders: Select query executed in ${durationMs} ms`);

    res.json({
      durationMs,
      rows: result.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.end();
  }
});

router.get("/ordersByCustomer", async (req, res) => {
  const client = createClient();
  const { customer_id } = req.query;
  if (!customer_id) {
    return res.status(400).json({ error: "Missing query parameters" });
  }
  try {
    const sql = nf3Queries.getAllOrders(customer_id);

    await client.connect();

    const startTime = process.hrtime.bigint(); // High-resolution time start

    const result = await client.query(sql);

    const endTime = process.hrtime.bigint(); // High-resolution time end
    const durationMs = Number(endTime - startTime) / 1_000_000; // Duration in milliseconds

    console.log(
      `\nNF3 Orders by customer: Select query executed in ${durationMs} ms`
    );

    res.json({
      durationMs,
      rows: result.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.end();
  }
});

router.get("/allProducts_stock", async (req, res) => {
  const client = createClient();
  try {
    await client.connect();

    const startTime = process.hrtime.bigint(); // High-resolution time start

    const sql = nf3Queries.getAllProductsStock;

    const result = await client.query(sql);

    const endTime = process.hrtime.bigint(); // High-resolution time end
    const durationMs = Number(endTime - startTime) / 1_000_000; // Duration in milliseconds

    console.log(
      `\nNF3 Products_stock: Select query executed in ${durationMs} ms`
    );

    res.json({
      durationMs,
      rows: result.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.end();
  }
});

// створюю для кожної таблиці окремий ендпоінт для додавання записів
Object.keys(nf3Fields).forEach((key) => {
  router.post(
    `/${key}`,
    createInsertRoute(createClient, "nf3", key, nf3Fields[key])
  );
});

export default router;
