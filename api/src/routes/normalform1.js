import express from "express";
import createClient from "../db/index.js";
import { nf1Fields } from "../utils/fields.js";
import { createInsertRoute } from "../utils/routeUtils.js";
import nf1Queries from "../selectQueries/nf1.js";

const router = new express.Router();

router.get("/truncate", async (req, res) => {
  const client = createClient();
  try {
    await client.connect();
    for (const key of Object.keys(nf1Fields)) {
      await client.query(`TRUNCATE TABLE nf1.${key} RESTART IDENTITY CASCADE;`);
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
    const sql = nf1Queries.getAllOrders(limit);

    await client.connect();

    const startTime = process.hrtime.bigint(); // High-resolution time start

    const result = await client.query(sql);

    const endTime = process.hrtime.bigint(); // High-resolution time end
    const durationMs = Number(endTime - startTime) / 1_000_000; // Duration in milliseconds

    console.log(`\nNF1 Orders: Select query executed in ${durationMs} ms`);

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
  const { customer_first_name, customer_last_name, customer_email } = req.query;
  if (!customer_first_name || !customer_last_name || !customer_email) {
    return res.status(400).json({ error: "Missing query parameters" });
  }
  try {
    const sql = nf1Queries.getAllOrders(
      customer_first_name.replaceAll("'", "''"),
      customer_last_name.replaceAll("'", "''"),
      customer_email
    );

    await client.connect();

    const startTime = process.hrtime.bigint(); // High-resolution time start

    const result = await client.query(sql);

    const endTime = process.hrtime.bigint(); // High-resolution time end
    const durationMs = Number(endTime - startTime) / 1_000_000; // Duration in milliseconds

    console.log(
      `\nNF1 Orders by customer: Select query executed in ${durationMs} ms`
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

    const sql = nf1Queries.getAllProductsStock;

    const result = await client.query(sql);

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
    res.status(500).json({ error: err.message });
  } finally {
    client.end();
  }
});

// Створюю для кожної таблиці окремий ендпоінт для додавання записів
Object.keys(nf1Fields).forEach((key) => {
  router.post(
    `/${key}`,
    createInsertRoute(createClient, "nf1", key, nf1Fields[key])
  );
});

export default router;
