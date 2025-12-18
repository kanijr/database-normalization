export default function combineNF1(nf2Tables) {
  const orders = nf2Tables.order_items.map((v, i) => {
    const { id: order_id, ...order } = nf2Tables.orders.find(
      (o) => o.id === v.order_id
    );
    const product = nf2Tables.products_stock.find((p) => p.id === v.product_id);

    return {
      ...order,
      ...product,
      quantity: v.quantity,
      order_id,
    };
  });
  const { supplier_contacts, products_stock } = nf2Tables;

  return {
    orders,
    products_stock,
    supplier_contacts,
  };
}

// export default function combineNF1(nf2Tables) {
//   const products_stock = nf2Tables.product_supplier_warehouse.map((psw, i) => {
//     const product = nf2Tables.products.find((p) => p.id === psw.product_id);
//     const supplier = nf2Tables.suppliers.find((s) => s.id === psw.supplier_id);
//     const warehouse = nf2Tables.warehouses.find(
//       (w) => w.id === psw.warehouse_id
//     );
//     return {
//       ...product,
//       ...supplier,
//       ...warehouse,
//       id: i,
//     };
//   });
//   const supplier_contacts = nf2Tables.supplier_contacts.map(
//     ({ supplier_id, ...sc }) => {
//       const supplier_name = nf2Tables.suppliers.find(
//         (s) => s.id === supplier_id
//       ).supplier_name;
//       return {
//         ...sc,
//         supplier_name,
//       };
//     }
//   );

//   // const orders = nf2Tables.order_items.map((v, i) => {
//   //   const { id: order_id, ...order } = nf2Tables.orders.find(
//   //     (o) => o.id === v.order_id
//   //   );
//   //   const product = nf2Tables.products.find((p) => p.id === v.product_id);
//   //   const supplier = nf2Tables.suppliers.find((s) => s.id === v.supplier_id);
//   //   const warehouse = nf2Tables.warehouses.find((w) => w.id === v.warehouse_id);

//   //   return {
//   //     ...order,
//   //     ...product,
//   //     ...supplier,
//   //     ...warehouse,
//   //     quantity: v.quantity,
//   //     order_id,
//   //   };
//   // });
//   const orders = nf2Tables.order_items.map((v, i) => {
//     const { id: order_id, ...order } = nf2Tables.orders.find(
//       (o) => o.id === v.order_id
//     );
//     const product = nf2Tables.product_stocks.find((p) => p.id === v.product_id);
//     const supplier = nf2Tables.suppliers.find((s) => s.id === v.supplier_id);
//     const warehouse = nf2Tables.warehouses.find((w) => w.id === v.warehouse_id);

//     return {
//       ...order,
//       ...product,
//       ...supplier,
//       ...warehouse,
//       quantity: v.quantity,
//       order_id,
//     };
//   });

//   return {
//     orders,
//     products_stock,
//     supplier_contacts,
//   };
// }
