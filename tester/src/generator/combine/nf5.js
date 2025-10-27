export default function combineNF4(nf4Tables) {
  const { product_supplier_warehouse, order_items, ...tables } = nf4Tables;

  const product_supplier = [];
  const supplier_warehouse = [];
  const product_warehouse = [];

  const seenPS = new Set();
  const seenSW = new Set();
  const seenPW = new Set();

  nf4Tables.product_supplier_warehouse.forEach(
    ({ product_id, supplier_id, warehouse_id }) => {
      const PSKey = `${product_id}-${supplier_id}`;

      if (!seenPS.has(PSKey)) {
        seenPS.add(PSKey);
        product_supplier.push({
          id: product_supplier.length + 1,
          product_id,
          supplier_id,
        });
      }

      const SWKey = `${supplier_id}-${warehouse_id}`;

      if (!seenSW.has(SWKey)) {
        seenSW.add(SWKey);
        supplier_warehouse.push({
          id: supplier_warehouse.length + 1,
          supplier_id,
          warehouse_id,
        });
      }
      const PWKey = `${product_id}-${warehouse_id}`;

      if (!seenPW.has(PWKey)) {
        seenPW.add(PWKey);
        product_warehouse.push({
          id: product_warehouse.length + 1,
          product_id,
          warehouse_id,
        });
      }
    }
  );

  const orderItems = order_items.map(
    ({ product_id, supplier_id, warehouse_id, ...order_items }) => {
      const product_supplier_id = product_supplier.find(
        (v) => v.product_id === product_id && v.supplier_id === supplier_id
      ).id;
      const supplier_warehouse_id = supplier_warehouse.find(
        (v) => v.supplier_id === supplier_id && v.warehouse_id === warehouse_id
      ).id;
      return {
        ...order_items,
        product_supplier_id,
        supplier_warehouse_id,
      };
    }
  );

  return {
    ...tables,
    product_supplier,
    supplier_warehouse,
    product_warehouse,
    order_items: orderItems,
  };
}
