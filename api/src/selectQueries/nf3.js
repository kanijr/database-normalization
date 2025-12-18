const nf3Queries = {
  getOrders: (
    limit,
    customerId
  ) => `SELECT oi3.order_id AS order_id, first_name AS customer_first_name, last_name AS customer_last_name,
    email AS customer_email, order_date, pm.method_name AS payment_method,
	  SUM(p.price * oi3.quantity) OVER (PARTITION BY o.id) AS payment_amount, payment_fee, 
    dm.method_name AS delivery_method, delivery_fee, r.region_name AS delivery_region, ci.city_name AS delivery_city,
    str.street_name AS delivery_street, ad.building AS delivery_house, ad.apartment AS delivery_apartment, delivery_date, 
    delivery_status, product_name, category_name, supplier_name, w.warehouse_name, rw.region_name AS warehouse_region, 
    ciw.city_name AS warehouse_city, strw.street_name AS warehouse_street, adw.building AS warehouse_building, 
    adw.apartment AS warehouse_apartment, quantity, price, sc.supplier_phones, sc.supplier_emails
    FROM nf3.order_items oi3
      JOIN nf3.orders o ON oi3.order_id = o.id
      JOIN nf3.customers c ON o.customer_id = c.id
      JOIN nf3.addresses ad ON o.delivery_address_id = ad.id
      JOIN nf3.streets str ON ad.street_id = str.id
      JOIN nf3.cities ci ON str.city_id = ci.id
      JOIN nf3.regions r ON ci.region_id = r.id
      JOIN nf3.delivery_methods dm ON o.delivery_method_id = dm.id
      JOIN nf3.payment_methods pm ON o.payment_method_id = pm.id
      JOIN nf3.products p ON oi3.product_id = p.id
      JOIN nf3.categories ca ON p.category_id = ca.id
      JOIN nf3.suppliers s ON oi3.supplier_id = s.id
      JOIN nf3.warehouses w ON oi3.warehouse_id = w.id
      JOIN nf3.addresses adw ON w.address_id = adw.id
      JOIN nf3.streets strw ON adw.street_id = strw.id
      JOIN nf3.cities ciw ON strw.city_id = ciw.id
      JOIN nf3.regions rw ON ciw.region_id = rw.id
      LEFT JOIN (
          SELECT 
              supplier_id,
              STRING_AGG(DISTINCT phone, ', ') AS supplier_phones,
              STRING_AGG(DISTINCT email, ', ') AS supplier_emails
          FROM nf3.supplier_contacts
          GROUP BY supplier_id
        ) sc ON sc.supplier_id = oi3.supplier_id
      ${customerId !== undefined ? `WHERE c.id = ${customerId}` : ""}
    ORDER BY order_id, product_name, supplier_name, warehouse_name ${
      limit !== undefined ? `\nLIMIT ${limit}` : ""
    };`,

  getProductsStock: (
    limit,
    supplier_id
  ) => `SELECT ps3.product_name, c.category_name, s.supplier_name,
        sc.supplier_phones, sc.supplier_emails, w.warehouse_name,
        r.region_name AS warehouse_region, ci.city_name AS warehouse_city,
        str.street_name AS warehouse_street, ad.building AS warehouse_building,
        ad.apartment AS warehouse_apartment, ps3.price
    FROM nf3.product_supplier_warehouse psw
    JOIN nf3.products ps3 ON ps3.id = psw.product_id
    JOIN nf3.categories c ON c.id = ps3.category_id
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
    JOIN nf3.addresses ad ON w.address_id = ad.id
    JOIN nf3.streets str ON ad.street_id = str.id
    JOIN nf3.cities ci ON ci.id = str.city_id
    JOIN nf3.regions r ON r.id = ci.region_id
    ${supplier_id !== undefined ? `WHERE s.id = ${supplier_id}` : ""} 
    ORDER BY psw.product_id, psw.supplier_id, psw.warehouse_id
    ${limit !== undefined ? `\nLIMIT ${limit}` : ""};`,
};

export default nf3Queries;
