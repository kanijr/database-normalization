const nf2Queries = {
  getOrders: (limit, customer) =>
    `SELECT oi2.order_id, customer_first_name, 
    customer_last_name, customer_email, order_date, payment_method,
    payment_amount, payment_fee, delivery_method, delivery_fee, delivery_region,
    delivery_city, delivery_street, delivery_house, delivery_apartment, delivery_date,
    delivery_status, product_name, category_name, p.supplier_name,warehouse_name,
    warehouse_region, warehouse_city, warehouse_street, warehouse_building,
    warehouse_apartment, quantity, price, sc.supplier_phones, sc.supplier_emails
    FROM nf2.order_items oi2
      JOIN nf2.orders o ON oi2.order_id = o.id
      JOIN nf2.products_stock p ON oi2.product_id = p.id
      LEFT JOIN (
          SELECT 
              supplier_name,
              STRING_AGG(DISTINCT phone, ', ') AS supplier_phones,
              STRING_AGG(DISTINCT email, ', ') AS supplier_emails
          FROM nf2.supplier_contacts
          GROUP BY supplier_name
        ) sc ON sc.supplier_name = p.supplier_name
        ${
          customer !== undefined
            ? `WHERE customer_first_name = '${customer.first_name}' AND 
      customer_last_name = '${customer.last_name}' AND customer_email = '${customer.email}'`
            : ""
        } 
    ORDER BY order_id, product_name, p.supplier_name, warehouse_name${
      limit !== undefined ? `\nLIMIT ${limit}` : ""
    };`,

  //   getOrders: (limit, customer) =>
  // `SELECT oi2.order_id, customer_first_name,
  // customer_last_name, customer_email, order_date, payment_method,
  // payment_amount, payment_fee, delivery_method, delivery_fee, delivery_region,
  // delivery_city, delivery_street, delivery_house, delivery_apartment, delivery_date,
  // delivery_status, product_name, category_name, s.supplier_name,warehouse_name,
  // warehouse_region, warehouse_city, warehouse_street, warehouse_building,
  // warehouse_apartment, quantity, price, sc.supplier_phones, sc.supplier_emails
  // FROM nf2.order_items oi2
  //   JOIN nf2.orders o ON oi2.order_id = o.id
  //   JOIN nf2.products p ON oi2.product_id = p.id
  //   JOIN nf2.suppliers s ON oi2.supplier_id = s.id
  //   JOIN nf2.warehouses w ON oi2.warehouse_id = w.id
  //   LEFT JOIN (
  //       SELECT
  //           supplier_id,
  //           STRING_AGG(DISTINCT phone, ', ') AS supplier_phones,
  //           STRING_AGG(DISTINCT email, ', ') AS supplier_emails
  //       FROM nf2.supplier_contacts
  //       GROUP BY supplier_id
  //     ) sc ON sc.supplier_id = s.id
  //     ${
  //       customer !== undefined
  //         ? `WHERE customer_first_name = '${customer.first_name}' AND
  //   customer_last_name = '${customer.last_name}' AND customer_email = '${customer.email}'`
  //         : ""
  //     }
  // ORDER BY order_id, product_name, s.supplier_name, warehouse_name${
  //   limit !== undefined ? `\nLIMIT ${limit}` : ""
  // };`,

  getProductsStock: (
    limit,
    supplier_name
  ) => `SELECT ps2.product_name, category_name, ps2.supplier_name,
        sc.supplier_phones, sc.supplier_emails, warehouse_name,
        warehouse_region, warehouse_city, warehouse_street,
        warehouse_building, warehouse_apartment, price
    FROM nf2.products_stock ps2
    LEFT JOIN (
      SELECT 
          supplier_name,
          STRING_AGG(DISTINCT phone, ', ') AS supplier_phones,
          STRING_AGG(DISTINCT email, ', ') AS supplier_emails
      FROM nf2.supplier_contacts
      GROUP BY supplier_name
    ) sc ON sc.supplier_name = ps2.supplier_name
              ${
                supplier_name !== undefined
                  ? `WHERE ps2.supplier_name = '${supplier_name}'`
                  : ""
              } 
    ORDER BY ps2.id${limit !== undefined ? `\nLIMIT ${limit}` : ""};`,
};

export default nf2Queries;
