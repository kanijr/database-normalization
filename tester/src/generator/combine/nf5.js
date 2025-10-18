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
        product_supplier.push({ product_id, supplier_id });
      }

      const SWKey = `${supplier_id}-${warehouse_id}`;

      if (!seenSW.has(SWKey)) {
        seenSW.add(SWKey);
        supplier_warehouse.push({ supplier_id, warehouse_id });
      }
      const PWKey = `${product_id}-${warehouse_id}`;

      if (!seenPW.has(PWKey)) {
        seenPW.add(PWKey);
        product_warehouse.push({ product_id, warehouse_id });
      }
    }
  );

  return {
    ...tables,
    product_supplier,
    supplier_warehouse,
    product_warehouse,
    order_items,
  };
}
