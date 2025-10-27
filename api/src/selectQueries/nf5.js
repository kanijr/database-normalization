const nf5Queries = {
  getAllOrders: (
    limit,
    customerId
  ) => `SELECT oi.order_id AS order_id, first_name AS customer_first_name, last_name AS customer_last_name,
    email AS customer_email, order_date, pm.method_name AS payment_method,
	  SUM(p.price * oi.quantity) OVER (PARTITION BY o.id) AS payment_amount, payment_fee, 
    dm.method_name AS delivery_method, delivery_fee, r.region_name AS delivery_region, ci.city_name AS delivery_city,
    str.street_name AS delivery_street, ad.building AS delivery_house, ad.apartment AS delivery_apartment, delivery_date, 
    delivery_status, product_name, category_name, supplier_name, w.warehouse_name, rw.region_name AS warehouse_region, 
    ciw.city_name AS warehouse_city, strw.street_name AS warehouse_street, adw.building AS warehouse_building, 
    adw.apartment AS warehouse_apartment, quantity, price, sc.supplier_phones, sc.supplier_emails
    FROM nf5.order_items oi
      JOIN nf5.orders o ON oi.order_id = o.id
      JOIN nf5.customers c ON o.customer_id = c.id
      JOIN nf5.addresses ad ON o.delivery_address_id = ad.id
      JOIN nf5.streets str ON ad.street_id = str.id
      JOIN nf5.cities ci ON str.city_id = ci.id
      JOIN nf5.regions r ON ci.region_id = r.id
      JOIN nf5.delivery_methods dm ON o.delivery_method_id = dm.id
      JOIN nf5.payment_methods pm ON o.payment_method_id = pm.id
      JOIN nf5.product_supplier ps ON oi.product_supplier_id = ps.id
      JOIN nf5.supplier_warehouse sw ON oi.supplier_warehouse_id = sw.id
      JOIN nf5.products p ON ps.product_id = p.id
      JOIN nf5.categories ca ON p.category_id = ca.id
      JOIN nf5.suppliers s ON ps.supplier_id = s.id
      JOIN nf5.warehouses w ON sw.warehouse_id = w.id
      JOIN nf5.addresses adw ON w.address_id = adw.id
      JOIN nf5.streets strw ON adw.street_id = strw.id
      JOIN nf5.cities ciw ON strw.city_id = ciw.id
      JOIN nf5.regions rw ON ciw.region_id = rw.id
      LEFT JOIN (
      SELECT sp.supplier_id,
            STRING_AGG(DISTINCT phone, ', ' ORDER BY phone) AS supplier_phones,
            STRING_AGG(DISTINCT email, ', ' ORDER BY email) AS supplier_emails
            FROM nf5.supplier_contact_phones sp
            INNER JOIN nf5.supplier_contact_emails se ON sp.supplier_id = se.supplier_id
            GROUP BY sp.supplier_id
      ) sc ON sc.supplier_id = s.id
      ${customerId !== undefined ? `WHERE c.id = ${customerId}` : ""}
    ORDER BY order_id, product_name, supplier_name, warehouse_name${
      limit !== undefined ? `\nLIMIT ${limit}` : ""
    };`,

  getAllProductsStock: `SELECT 
        CAST(ROW_NUMBER() OVER(
          ORDER BY psw.product_id, psw.supplier_id, psw.warehouse_id
        ) AS INT) AS product_id,
        ps.product_name,
        c.category_name,
        s.supplier_name,
        sc.supplier_phones,
        sc.supplier_emails,
        w.warehouse_name,
        r.region_name AS warehouse_region,
        ci.city_name AS warehouse_city,
        str.street_name AS warehouse_street,
        ad.building AS warehouse_building,
        ad.apartment AS warehouse_apartment,
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
      SELECT sp.supplier_id,
            STRING_AGG(DISTINCT phone, ', ' ORDER BY phone) AS supplier_phones,
            STRING_AGG(DISTINCT email, ', ' ORDER BY email) AS supplier_emails
            FROM nf5.supplier_contact_phones sp
            INNER JOIN nf5.supplier_contact_emails se ON sp.supplier_id = se.supplier_id
            GROUP BY sp.supplier_id
      ) sc ON sc.supplier_id = s.id
    JOIN nf5.addresses ad ON w.address_id = ad.id
    JOIN nf5.streets str ON ad.street_id = str.id
    JOIN nf5.cities ci ON ci.id = str.city_id
    JOIN nf5.regions r ON r.id = ci.region_id;`,
};

export default nf5Queries;
