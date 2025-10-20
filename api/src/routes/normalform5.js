import express from "express";
import createClient from "../db/index.js";
import { nf5Fields } from "../utils/fields.js";
import { createInsertRoute } from "../utils/routeUtils.js";

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
    return res.status(400).json({ error: err.message });
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
    FROM nf5.order_items oi
      JOIN nf5.orders o ON oi.order_id = o.id
      JOIN nf5.customers c ON o.customer_id = c.id
      JOIN nf5.delivery_addresses da ON o.delivery_address_id = da.id
      JOIN nf5.regions rda ON da.region_id = rda.id
      JOIN nf5.delivery_methods dm ON o.delivery_method_id = dm.id
      JOIN nf5.payment_methods pm ON o.payment_method_id = pm.id
      JOIN nf5.products p ON oi.product_id = p.id
      JOIN nf5.categories ca ON p.category_id = ca.id
      JOIN nf5.suppliers s ON oi.supplier_id = s.id
      JOIN nf5.warehouses w ON oi.warehouse_id = w.id
      JOIN nf5.regions rw ON w.region_id = rw.id
    ORDER BY order_id, product_name, supplier_name, warehouse_region;`;

    const startTime = process.hrtime.bigint(); // High-resolution time start

    await client.connect();
    const result = await client.query(sql);

    const endTime = process.hrtime.bigint(); // High-resolution time end
    const durationMs = Number(endTime - startTime) / 1_000_000; // Duration in milliseconds

    console.log(`\nNF5 Orders: Select query executed in ${durationMs} ms`);

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

    // const sql = `WITH product_supplier_warehouse AS (
    //   SELECT
    //     ps.product_id,
    //     ps.supplier_id,
    //     sw.warehouse_id
    //   FROM nf5.product_supplier ps
    //   JOIN nf5.supplier_warehouse sw ON sw.supplier_id = ps.supplier_id
    //   JOIN nf5.product_warehouse pw ON (pw.product_id = ps.product_id) AND
    //     (pw.warehouse_id = sw.warehouse_id)
    // )
    // SELECT
    //     CAST(ROW_NUMBER() OVER(
    //       ORDER BY psw.product_id, psw.supplier_id, psw.warehouse_id
    //     ) AS INT) AS product_id,
    //     ps.product_name,
    //     c.category_name,
    //     s.supplier_name,
    //    (
    //         SELECT STRING_AGG(DISTINCT phone, ', ')
    //         FROM nf4.supplier_contact_phones sp
    //         WHERE sp.supplier_id = s.id
    //     ) AS supplier_phones,
    //     (
    //         SELECT STRING_AGG(DISTINCT email, ', ')
    //         FROM nf4.supplier_contact_emails se
    //         WHERE se.supplier_id = s.id
    //     ) AS supplier_emails,
    //     r.region_name AS warehouse_region,
    //     w.city AS warehouse_city,
    //     w.street AS warehouse_street,
    //     w.building AS warehouse_building,
    //     w.apartment AS warehouse_apartment,
    //     ps.price
    // FROM product_supplier_warehouse psw
    // JOIN nf5.products ps ON ps.id = psw.product_id
    // JOIN nf5.categories c ON c.id = ps.category_id
    // JOIN nf5.suppliers s ON s.id = psw.supplier_id
    // JOIN nf5.warehouses w ON w.id = psw.warehouse_id
    // JOIN nf5.regions r ON r.id = w.region_id`;

    const sql = `SELECT 
        CAST(ROW_NUMBER() OVER(
          ORDER BY psw.product_id, psw.supplier_id, psw.warehouse_id
        ) AS INT) AS product_id,
        ps.product_name,
        c.category_name,
        s.supplier_name,
        sp.phones AS supplier_phones,
        se.emails AS supplier_emails,
        r.region_name AS warehouse_region,
        w.city AS warehouse_city,
        w.street AS warehouse_street,
        w.building AS warehouse_building,
        w.apartment AS warehouse_apartment,
        ps.price
    FROM (
      SELECT 
        ps.product_id,
        ps.supplier_id,
        sw.warehouse_id
      FROM nf5.product_supplier ps
      JOIN nf5.supplier_warehouse sw ON sw.supplier_id = ps.supplier_id
      JOIN nf5.product_warehouse pw ON (pw.product_id = ps.product_id) AND
        (pw.warehouse_id = sw.warehouse_id)
      ) psw
    JOIN nf5.products ps ON ps.id = psw.product_id
    JOIN nf5.categories c ON c.id = ps.category_id
    JOIN nf5.suppliers s ON s.id = psw.supplier_id
    JOIN nf5.warehouses w ON w.id = psw.warehouse_id
    LEFT JOIN (
            SELECT supplier_id, STRING_AGG(DISTINCT phone, ', ') AS phones
            FROM nf4.supplier_contact_phones
            GROUP BY supplier_id
        ) sp ON sp.supplier_id = s.id
    LEFT JOIN ( 
            SELECT supplier_id, STRING_AGG(DISTINCT email, ', ') AS emails
            FROM nf4.supplier_contact_emails
            GROUP BY supplier_id
        ) se ON se.supplier_id = s.id
    JOIN nf5.regions r ON r.id = w.region_id`;

    await client.connect();
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
    return res.status(500).json({ error: err.message });
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
