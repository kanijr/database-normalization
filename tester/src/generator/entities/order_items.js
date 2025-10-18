import { fakerUK as faker } from "@faker-js/faker";

export function generateOrderItems(orders, productSupplierWarehouses, n = 500) {
  const uniqueCombinations = new Set();
  const results = [];

  const limit = Math.min(n, orders.length * productSupplierWarehouses.length);

  while (results.length < limit) {
    const order = faker.helpers.arrayElement(orders);
    const { product_id, supplier_id, warehouse_id } =
      faker.helpers.arrayElement(productSupplierWarehouses);

    const key = `${order.id}-${product_id}-${supplier_id}-${warehouse_id}`;

    if (!uniqueCombinations.has(key)) {
      uniqueCombinations.add(key);
      results.push({
        order_id: order.id,
        product_id,
        supplier_id,
        warehouse_id,
        quantity: faker.number.int({ min: 1, max: 20 }),
      });
    }
  }

  return results;
}
