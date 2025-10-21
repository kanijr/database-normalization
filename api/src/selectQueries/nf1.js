const nf1Queries = {
  getAllOrders: `SELECT * FROM nf1.orders 
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
    FROM nf1.products_stock ps
    LEFT JOIN (
      SELECT 
          supplier_name,
          STRING_AGG(DISTINCT phone, ', ') AS supplier_phones,
          STRING_AGG(DISTINCT email, ', ') AS supplier_emails
      FROM nf1.supplier_contacts
      GROUP BY supplier_name
    ) sc ON sc.supplier_name = ps.supplier_name
    ORDER BY ps.id;`,
};

export default nf1Queries;
