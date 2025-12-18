const nnfQueries = {
  getOrders: (limit, customer) =>
    `SELECT o.* FROM nnf.orders o
     ${
       customer !== undefined
         ? `WHERE customer_full_name = '${customer.full_name}' AND  customer_email = '${customer.email}'`
         : ""
     } 
    ORDER BY order_id, product_name, supplier_name, warehouse_name${
      limit !== undefined ? `\nLIMIT ${limit}` : ""
    };`,

  getProductsStock: (
    limit,
    supplier_name
  ) => `SELECT ps.* FROM nnf.products_stock ps
          ${
            supplier_name !== undefined
              ? `WHERE ps.supplier_name = '${supplier_name}'`
              : ""
          } 
    ORDER BY ps.id ${limit !== undefined ? `\nLIMIT ${limit}` : ""};`,
};

export default nnfQueries;
