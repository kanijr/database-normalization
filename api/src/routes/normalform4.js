import express from "express";
import pool from "../db/index.js";
import { nf4Fields } from "../utils/fields.js";
import { createInsertRoute } from "../utils/routeUtils.js";

const router = new express.Router();

router.get("/truncate", async (req, res) => {
  try {
    for (const k of Object.keys(nf4Fields)) {
      await pool.query(`TRUNCATE TABLE nf4.${k} RESTART IDENTITY CASCADE;`);
    }

    res.status(200).json({});
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.get("/allOrders", async (req, res) => {
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
    FROM nf4.order_items oi
      JOIN nf4.orders o ON oi.order_id = o.id
      JOIN nf4.customers c ON o.customer_id = c.id
      JOIN nf4.delivery_addresses da ON o.delivery_address_id = da.id
      JOIN nf4.regions rda ON da.region_id = rda.id
      JOIN nf4.delivery_methods dm ON o.delivery_method_id = dm.id
      JOIN nf4.payment_methods pm ON o.payment_method_id = pm.id
      JOIN nf4.products p ON oi.product_id = p.id
      JOIN nf4.categories ca ON p.category_id = ca.id
      JOIN nf4.suppliers s ON oi.supplier_id = s.id
      JOIN nf4.warehouses w ON oi.warehouse_id = w.id
      JOIN nf4.regions rw ON w.region_id = rw.id
    ORDER BY order_id, product_name, supplier_name, warehouse_region;`;
    const startTime = process.hrtime.bigint(); // High-resolution time start

    const result = await pool.query(sql);

    const endTime = process.hrtime.bigint(); // High-resolution time end
    const durationMs = Number(endTime - startTime) / 1_000_000; // Duration in milliseconds

    console.log(`\nNF4 Orders: Select query executed in ${durationMs} ms`);

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
          sp.supplier_id,
          STRING_AGG(DISTINCT sp.phone, ', ') AS supplier_phones,
          STRING_AGG(DISTINCT se.email, ', ') AS supplier_emails
      FROM nf4.supplier_contact_phones sp
      JOIN nf4.supplier_contact_emails se ON se.supplier_id = sp.supplier_id
      GROUP BY sp.supplier_id
    )
    SELECT 
        CAST(ROW_NUMBER() OVER(
          ORDER BY psw.product_id, psw.supplier_id, psw.warehouse_id
        ) AS INT) AS product_id,
        ps.product_name,
        c.category_name,
        s.supplier_name,
        sca.supplier_phones,
        sca.supplier_emails,
        r.region_name AS warehouse_region,
        w.city AS warehouse_city,
        w.street AS warehouse_street,
        w.building AS warehouse_building,
        w.apartment AS warehouse_apartment,
        ps.price
    FROM nf4.product_supplier_warehouse psw
    JOIN nf4.products ps ON ps.id = psw.product_id
    JOIN nf4.categories c ON c.id = ps.category_id
    JOIN nf4.suppliers s ON s.id = psw.supplier_id
    LEFT JOIN supplier_contacts_agg sca ON sca.supplier_id = s.id
    JOIN nf4.warehouses w ON w.id = psw.warehouse_id
    JOIN nf4.regions r ON r.id = w.region_id`;

    const result = await pool.query(sql);

    const endTime = process.hrtime.bigint(); // High-resolution time end
    const durationMs = Number(endTime - startTime) / 1_000_000; // Duration in milliseconds

    console.log(
      `\nNF4 Products_stock: Select query executed in ${durationMs} ms`
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
Object.keys(nf4Fields).forEach((key) => {
  router.post(
    `/${key}`,
    createInsertRoute(
      pool,
      "nf4",
      key,
      nf4Fields[key].filter((f) => f !== "id")
    )
  );
});

export default router;
