const nf4Queries = {
  getOrders: (
    limit,
    customerId
  ) => `SELECT oi4.order_id AS order_id, first_name AS customer_first_name, last_name AS customer_last_name,
      email AS customer_email, order_date, pm.method_name AS payment_method,
      SUM(p.price * oi4.quantity) OVER (PARTITION BY o.id) AS payment_amount, payment_fee, 
      dm.method_name AS delivery_method, delivery_fee, r.region_name AS delivery_region, ci.city_name AS delivery_city,
      str.street_name AS delivery_street, ad.building AS delivery_house, ad.apartment AS delivery_apartment, delivery_date, 
      delivery_status, product_name, category_name, supplier_name, w.warehouse_name, rw.region_name AS warehouse_region, 
      ciw.city_name AS warehouse_city, strw.street_name AS warehouse_street, adw.building AS warehouse_building, 
      adw.apartment AS warehouse_apartment, quantity, price, sc.supplier_phones, sc.supplier_emails
      FROM nf4.order_items oi4
        JOIN nf4.orders o ON oi4.order_id = o.id
        JOIN nf4.customers c ON o.customer_id = c.id
        JOIN nf4.addresses ad ON o.delivery_address_id = ad.id
        JOIN nf4.streets str ON ad.street_id = str.id
        JOIN nf4.cities ci ON str.city_id = ci.id
        JOIN nf4.regions r ON ci.region_id = r.id
        JOIN nf4.delivery_methods dm ON o.delivery_method_id = dm.id
        JOIN nf4.payment_methods pm ON o.payment_method_id = pm.id
        JOIN nf4.products p ON oi4.product_id = p.id
        JOIN nf4.categories ca ON p.category_id = ca.id
        JOIN nf4.suppliers s ON oi4.supplier_id = s.id
        LEFT JOIN (
        SELECT sp.supplier_id,
              STRING_AGG(DISTINCT phone, ', ' ORDER BY phone) AS supplier_phones,
              STRING_AGG(DISTINCT email, ', ' ORDER BY email) AS supplier_emails
              FROM nf4.supplier_contact_phones sp
              INNER JOIN nf4.supplier_contact_emails se ON sp.supplier_id = se.supplier_id
              GROUP BY sp.supplier_id
        ) sc ON sc.supplier_id = s.id
        JOIN nf4.warehouses w ON oi4.warehouse_id = w.id
        JOIN nf4.addresses adw ON w.address_id = adw.id
        JOIN nf4.streets strw ON adw.street_id = strw.id
        JOIN nf4.cities ciw ON strw.city_id = ciw.id
        JOIN nf4.regions rw ON ciw.region_id = rw.id
      ${customerId !== undefined ? `WHERE c.id = ${customerId}` : ""}
    ORDER BY order_id, product_name, supplier_name, warehouse_name${
      limit !== undefined ? `\nLIMIT ${limit}` : ""
    };`,

  getProductsStock: (
    limit,
    supplier_id
  ) => `SELECT ps4.product_name, c.category_name, s.supplier_name,
        sc.supplier_phones, sc.supplier_emails, w.warehouse_name,
        r.region_name AS warehouse_region, ci.city_name AS warehouse_city,
        str.street_name AS warehouse_street, ad.building AS warehouse_building,
        ad.apartment AS warehouse_apartment, ps4.price
    FROM nf4.product_supplier_warehouse psw
    JOIN nf4.products ps4 ON ps4.id = psw.product_id
    JOIN nf4.categories c ON c.id = ps4.category_id
    JOIN nf4.suppliers s ON s.id = psw.supplier_id
    JOIN nf4.warehouses w ON w.id = psw.warehouse_id
    LEFT JOIN (
        SELECT sp.supplier_id,
              STRING_AGG(DISTINCT phone, ', ' ORDER BY phone) AS supplier_phones,
              STRING_AGG(DISTINCT email, ', ' ORDER BY email) AS supplier_emails
              FROM nf4.supplier_contact_phones sp
              INNER JOIN nf4.supplier_contact_emails se ON sp.supplier_id = se.supplier_id
              GROUP BY sp.supplier_id
        ) sc ON sc.supplier_id = s.id
    JOIN nf4.addresses ad ON w.address_id = ad.id
    JOIN nf4.streets str ON ad.street_id = str.id
    JOIN nf4.cities ci ON ci.id = str.city_id
    JOIN nf4.regions r ON r.id = ci.region_id
    ${supplier_id !== undefined ? `WHERE s.id = '${supplier_id}'` : ""} 
    ORDER BY psw.product_id, psw.supplier_id, psw.warehouse_id
    ${limit !== undefined ? `\nLIMIT ${limit}` : ""};`,
};

export default nf4Queries;
