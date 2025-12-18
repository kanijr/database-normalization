const nf1Queries = {
  getOrders: (limit, customer) =>
    `SELECT o1.*, sc.supplier_phones, sc.supplier_emails FROM nf1.orders o1
       LEFT JOIN (
            SELECT
                supplier_name,
                STRING_AGG(DISTINCT phone, ', ') AS supplier_phones,
                STRING_AGG(DISTINCT email, ', ') AS supplier_emails
            FROM nf1.supplier_contacts
            GROUP BY supplier_name
          ) sc ON sc.supplier_name = o1.supplier_name
     ${
       customer !== undefined
         ? `WHERE customer_first_name = '${customer.first_name}' AND 
      customer_last_name = '${customer.last_name}' AND customer_email = '${customer.email}'`
         : ""
     } 
    ORDER BY order_id, product_name, supplier_name, warehouse_name${
      limit !== undefined ? `\nLIMIT ${limit}` : ""
    };`,

  getProductsStock: (
    limit,
    supplier_name
  ) => `SELECT ps1.product_name, category_name, ps1.supplier_name,
        sc.supplier_phones, sc.supplier_emails, warehouse_name,
        warehouse_region, warehouse_city, warehouse_street,
        warehouse_building, warehouse_apartment, price
    FROM nf1.products_stock ps1
    LEFT JOIN (
      SELECT 
          supplier_name,
          STRING_AGG(DISTINCT phone, ', ') AS supplier_phones,
          STRING_AGG(DISTINCT email, ', ') AS supplier_emails
      FROM nf1.supplier_contacts
      GROUP BY supplier_name
    ) sc ON sc.supplier_name = ps1.supplier_name
          ${
            supplier_name !== undefined
              ? `WHERE ps1.supplier_name = '${supplier_name}'`
              : ""
          } 
    ORDER BY ps1.id ${limit !== undefined ? `\nLIMIT ${limit}` : ""};`,
};

export default nf1Queries;
