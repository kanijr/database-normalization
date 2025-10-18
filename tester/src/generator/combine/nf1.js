export default function combineNF1(nf2Tables) {
  const orders = nf2Tables.order_items.map((v, i) => {
    const {
      customer_id,
      id: order_id,
      ...order
    } = nf2Tables.orders.find((o) => o.id === v.order_id);
    const customer = nf2Tables.customers.find((c) => c.id === customer_id);
    const product = nf2Tables.products_stock.find((p) => p.id === v.product_id);

    return {
      ...order,
      ...product,
      quantity: v.quantity,
      customer_first_name: customer.first_name,
      customer_last_name: customer.last_name,
      customer_email: customer.email,
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
