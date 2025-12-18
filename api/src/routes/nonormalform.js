import express from "express";
import pool from "../db/index.js";
import { nnfFields } from "../utils/fields.js";
import { createInsertRoute, getQueryExecTime } from "../utils/routeUtils.js";
import nnfQueries from "../selectQueries/nnf.js";

const router = new express.Router();

router.get("/truncate", async (req, res) => {
  try {
    // for (const key of Object.keys(nnfFields)) {
    //   await pool.query(`TRUNCATE TABLE nnf.${key} RESTART IDENTITY CASCADE;`);
    // }

    for (const key of ["orders", "products_stock"]) {
      await pool.query(`DELETE FROM nnf.${key};`);
    }

    res.status(200).json({});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/orders", async (req, res) => {
  const { limit, customer_full_name, customer_email } = req.query;

  let customer = undefined;
  if (customer_full_name && customer_email) {
    customer = {
      full_name: customer_full_name,
      email: customer_email,
    };
  } else if (customer_full_name || customer_email) {
    return res.status(400).json({ error: "Missing query parameters" });
  }

  try {
    const sql = nnfQueries.getOrders(limit, customer);

    const startTime = process.hrtime.bigint(); // High-resolution time start

    const result = await pool.query(sql);

    const endTime = process.hrtime.bigint(); // High-resolution time end
    const durationMs = Number(endTime - startTime) / 1_000_000; // Duration in milliseconds

    console.log(`\nnnf Orders: Select query executed in ${durationMs} ms`);

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
  const { limit, supplier_name } = req.query;
  try {
    const startTime = process.hrtime.bigint(); // High-resolution time start

    const sql = nnfQueries.getProductsStock(limit, supplier_name);

    const result = await pool.query(sql);

    const endTime = process.hrtime.bigint(); // High-resolution time end
    const durationMs = Number(endTime - startTime) / 1_000_000; // Duration in milliseconds

    console.log(
      `\nnnf Products_stock: Select query executed in ${durationMs} ms`
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

// Створюю для кожної таблиці окремий ендпоінт для додавання записів
Object.keys(nnfFields).forEach((key) => {
  router.post(`/${key}`, createInsertRoute("nnf", key, nnfFields[key]));
});

export default router;
