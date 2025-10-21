const nf2Queries = {
  getAllOrders: (
    customerId
  ) => `SELECT oi.order_id AS order_id, first_name AS customer_first_name, 
    last_name AS customer_last_name, email AS customer_email, order_date, payment_method,
    payment_amount, payment_fee, delivery_method, delivery_fee, delivery_region,
    delivery_city, delivery_street, delivery_house, delivery_apartment, delivery_date,
    delivery_status, product_name, category_name, supplier_name, warehouse_region,
    warehouse_city, warehouse_street, warehouse_building, warehouse_apartment, quantity, price 
    FROM nf2.order_items oi 
      JOIN nf2.orders o ON oi.order_id = o.id
      JOIN nf2.customers c ON o.customer_id = c.id
      JOIN nf2.products_stock p ON oi.product_id = p.id
    ${customerId !== undefined ? `WHERE c.id = ${customerId}` : ""}
    ORDER BY order_id, product_name, supplier_name, warehouse_region, warehouse_city;`,

  getAllProductsStock: `SELECT 
        ps.id AS product_id,
        product_name, category_name,
        ps.supplier_name,
        sc.supplier_phones, 
        sc.supplier_emails,
        warehouse_region, warehouse_city,
        warehouse_street, warehouse_building,
        warehouse_apartment, price
    FROM nf2.products_stock ps
    LEFT JOIN (
      SELECT 
          supplier_name,
          STRING_AGG(DISTINCT phone, ', ') AS supplier_phones,
          STRING_AGG(DISTINCT email, ', ') AS supplier_emails
      FROM nf2.supplier_contacts
      GROUP BY supplier_name
    ) sc ON sc.supplier_name = ps.supplier_name
    ORDER BY ps.id;`,
};

export default nf2Queries;
