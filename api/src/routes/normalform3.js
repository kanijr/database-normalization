import express from "express";
import createClient from "../db/index.js";
import { nf3Fields } from "../utils/fields.js";
import { createInsertRoute } from "../utils/routeUtils.js";

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
    return res.status(400).json({ error: err.message });
  } finally {
    client.end();
  }
});

router.get("/allOrders", async (req, res) => {
  const client = createClient();
  try {
    // EXPLAIN ANALYZE
    const sql = `SELECT oi.order_id AS order_id, first_name AS customer_first_name, last_name AS customer_last_name,
    email AS customer_email, order_date, pm.method_name AS payment_method,
	  SUM(p.price * oi.quantity) OVER (PARTITION BY o.id) AS payment_amount, payment_fee, 
    dm.method_name AS delivery_method, delivery_fee, rda.region_name AS delivery_region, da.city AS delivery_city,
    da.street AS delivery_street, house AS delivery_house, da.apartment AS delivery_apartment, delivery_date, 
    delivery_status, product_name,  category_name, supplier_name, rw.region_name AS warehouse_region, 
    w.city AS warehouse_city, w.street AS warehouse_street, building AS warehouse_building, 
    w.apartment AS warehouse_apartment, quantity, price
    FROM nf3.order_items oi
      JOIN nf3.orders o ON oi.order_id = o.id
      JOIN nf3.customers c ON o.customer_id = c.id
      JOIN nf3.delivery_addresses da ON o.delivery_address_id = da.id
      JOIN nf3.regions rda ON da.region_id = rda.id
      JOIN nf3.delivery_methods dm ON o.delivery_method_id = dm.id
      JOIN nf3.payment_methods pm ON o.payment_method_id = pm.id
      JOIN nf3.products p ON oi.product_id = p.id
      JOIN nf3.categories ca ON p.category_id = ca.id
      JOIN nf3.suppliers s ON oi.supplier_id = s.id
      JOIN nf3.warehouses w ON oi.warehouse_id = w.id
      JOIN nf3.regions rw ON w.region_id = rw.id
    ORDER BY order_id, product_name, supplier_name, warehouse_region;`;

    const startTime = process.hrtime.bigint(); // High-resolution time start
    await client.connect();
    const result = await client.query(sql);

    const endTime = process.hrtime.bigint(); // High-resolution time end
    const durationMs = Number(endTime - startTime) / 1_000_000; // Duration in milliseconds

    console.log(`\nNF3 Orders: Select query executed in ${durationMs} ms`);

    res.json({
      durationMs,
      rows: result.rows,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    client.end();
  }
});

router.get("/allProducts_stock", async (req, res) => {
  const client = createClient();
  try {
    const startTime = process.hrtime.bigint(); // High-resolution time start

    const sql = `SELECT 
        CAST(ROW_NUMBER() OVER(
          ORDER BY psw.product_id, psw.supplier_id, psw.warehouse_id
        ) AS INT) AS product_id,
        ps.product_name,
        c.category_name,
        s.supplier_name,
        sc.supplier_phones,
        sc.supplier_emails,
        r.region_name AS warehouse_region,
        w.city AS warehouse_city,
        w.street AS warehouse_street,
        w.building AS warehouse_building,
        w.apartment AS warehouse_apartment,
        ps.price
    FROM nf3.product_supplier_warehouse psw
    JOIN nf3.products ps ON ps.id = psw.product_id
    JOIN nf3.categories c ON c.id = ps.category_id
    JOIN nf3.suppliers s ON s.id = psw.supplier_id
    LEFT JOIN (
      SELECT 
          supplier_id,
          STRING_AGG(DISTINCT phone, ', ') AS supplier_phones,
          STRING_AGG(DISTINCT email, ', ') AS supplier_emails
      FROM nf3.supplier_contacts
      GROUP BY supplier_id
    ) sc ON sc.supplier_id = s.id
    JOIN nf3.warehouses w ON w.id = psw.warehouse_id
    JOIN nf3.regions r ON r.id = w.region_id;`;

    await client.connect();
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
    return res.status(500).json({ error: err.message });
  } finally {
    client.end();
  }
});

// створюю для кожної таблиці окремий ендпоінт для додавання записів
Object.keys(nf3Fields).forEach((key) => {
  router.post(
    `/${key}`,
    createInsertRoute(
      createClient,
      "nf3",
      key,
      nf3Fields[key].filter((f) => f !== "id")
    )
  );
});

export default router;
