import express from "express";
import createClient from "../db/index.js";
import { nf5Fields } from "../utils/fields.js";
import { createInsertRoute } from "../utils/routeUtils.js";
import nf5Queries from "../selectQueries/nf5.js";

const router = new express.Router();

router.get("/truncate", async (req, res) => {
  const client = createClient();
  try {
    await client.connect();
    for (const k of Object.keys(nf5Fields)) {
      await client.query(`TRUNCATE TABLE nf5.${k} RESTART IDENTITY CASCADE;`);
    }

    res.status(200).json({});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/allOrders", async (req, res) => {
  const client = createClient();
  try {
    const sql = nf5Queries.getAllOrders();

    await client.connect();

    const startTime = process.hrtime.bigint(); // High-resolution time start

    const result = await client.query(sql);

    const endTime = process.hrtime.bigint(); // High-resolution time end
    const durationMs = Number(endTime - startTime) / 1_000_000; // Duration in milliseconds

    console.log(`\nNF5 Orders: Select query executed in ${durationMs} ms`);

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
    const sql = nf5Queries.getAllOrders(customer_id);

    await client.connect();

    const startTime = process.hrtime.bigint(); // High-resolution time start

    const result = await client.query(sql);

    const endTime = process.hrtime.bigint(); // High-resolution time end
    const durationMs = Number(endTime - startTime) / 1_000_000; // Duration in milliseconds

    console.log(
      `\nNF5 Orders by customer: Select query executed in ${durationMs} ms`
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

    const sql = nf5Queries.getAllProductsStock;

    const result = await client.query(sql);

    const endTime = process.hrtime.bigint(); // High-resolution time end
    const durationMs = Number(endTime - startTime) / 1_000_000; // Duration in milliseconds

    console.log(
      `\nNF5 Products_stock: Select query executed in ${durationMs} ms`
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
Object.keys(nf5Fields).forEach((key) => {
  router.post(
    `/${key}`,
    createInsertRoute(
      createClient,
      "nf5",
      key,
      nf5Fields[key].filter((f) => f !== "id")
    )
  );
});

export default router;
