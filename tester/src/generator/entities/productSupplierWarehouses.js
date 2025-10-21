import { fakerUK as faker } from "@faker-js/faker";

export function generateProductSupplierWarehouses(
  products,
  suppliers,
  warehouses,
  n = 150,
  maxWarehousesPerProduct = 7,
  maxProductsPerSupplier = 8
) {
  let flag = false;
  while (true) {
    const psw = [];
    const productToWarehouses = new Map();

    // Заздалегідь створюємо для кожного товару кілька складів
    for (const product of products) {
      const count = faker.number.int({ min: 1, max: maxWarehousesPerProduct });
      const available = faker.helpers
        .shuffle(warehouses.map(({ id }) => id))
        .slice(0, count);
      productToWarehouses.set(product.id, available);
    }

    // Для кожного постачальника створюємо записи
    outer: for (const supplier of faker.helpers.shuffle(suppliers)) {
      const productCount = faker.number.int({
        min: 1,
        max: maxProductsPerSupplier,
      });
      const chosenProducts = faker.helpers
        .shuffle(products)
        .slice(0, productCount);

      product_loop: for (const product of chosenProducts) {
        const whs = productToWarehouses.get(product.id);
        if (!whs || whs.length === 0) continue;

        const requiredWhs = [
          ...new Set(
            psw
              .filter(
                (value) =>
                  value.supplier_id === supplier.id &&
                  whs.includes(value.warehouse_id)
              )
              .map(({ warehouse_id }) => warehouse_id)
          ),
        ];

        if (requiredWhs.length !== 0) {
          if (psw.length + requiredWhs.length > n) continue product_loop;

          // Додаємо комбінації (product, supplier, warehouse)
          for (const warehouseId of requiredWhs) {
            psw.push({
              product_id: product.id,
              supplier_id: supplier.id,
              warehouse_id: warehouseId,
            });
          }
          if (psw.length >= n) break outer; // зупиняємо рівно на n записах
        }
        const availableWhs = whs.filter((id) => !requiredWhs.includes(id));

        // Додаємо комбінації (product, supplier, warehouse)
        for (const warehouseId of availableWhs) {
          psw.push({
            product_id: product.id,
            supplier_id: supplier.id,
            warehouse_id: warehouseId,
          });

          if (psw.length >= n) break outer; // зупиняємо рівно на n записах
        }
      }
    }

    if (psw.length !== n) {
      if (flag === true) {
        console.warn(
          `\nFor generate ${n} psw needs bigers maxWarehousesPerProduct and maxProductsPerSupplier\n`
        );
        maxWarehousesPerProduct++;
        maxProductsPerSupplier++;
      }
      flag = true;
      continue;
    }

    return psw;
  }
}
