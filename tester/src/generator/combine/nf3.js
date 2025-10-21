import {
  generateCustomers,
  generatePaymentMethods,
  generateDeliveryMethods,
  generateRegions,
  generateDeliveryRegionPayments,
  generateDeliveryAddresses,
  generateOrders,
  generateCategories,
  generateWarehouses,
  generateSuppliers,
  generateProducts,
  generateProductSupplierWarehouses,
  generateOrderItems,
  generateSupplierContacts,
} from "../entities/index.js";
import _ from "lodash";

// export default function combineNF3(sizes) {
//   const tables = {};

//   tables.customers = generateCustomers(500);
//   tables.payment_methods = generatePaymentMethods();
//   tables.delivery_methods = generateDeliveryMethods();
//   tables.regions = generateRegions(27);
//   tables.delivery_region_payments = generateDeliveryRegionPayments(
//     tables.delivery_methods,
//     tables.regions,
//     tables.payment_methods,
//     180
//   );
//   tables.delivery_addresses = generateDeliveryAddresses(tables.regions, 150);
//   tables.orders = generateOrders(
//     tables.customers,
//     tables.delivery_region_payments,
//     tables.delivery_addresses,
//     800
//   );
//   tables.categories = generateCategories(35);

//   // Кількість записів у product_supplier_warehouse
//   const numPSW = 1000;

//   tables.products = generateProducts(
//     tables.categories,
//     Math.min(150, Math.max(12, Math.floor(numPSW * 0.045)))
//   );
//   tables.suppliers = generateSuppliers(
//     Math.min(150, Math.max(12, Math.floor(numPSW * 0.05)))
//   );
//   tables.warehouses = generateWarehouses(
//     tables.regions,
//     Math.max(10, Math.min(100, Math.floor(numPSW * 0.03)))
//   );

//   tables.product_supplier_warehouse = _.sortBy(
//     generateProductSupplierWarehouses(
//       tables.products,
//       tables.suppliers,
//       tables.warehouses,
//       numPSW
//     ),
//     ["product_id", "supplier_id", "warehouse_id"]
//   );

//   tables.supplier_contacts = generateSupplierContacts(
//     tables.suppliers,
//     tables.suppliers.length * 1.3
//   );

//   tables.order_items = generateOrderItems(
//     tables.orders,
//     tables.product_supplier_warehouse,
//     150
//   );

//   return tables;
// }

export default function combineNF3(sizes) {
  const tables = {};

  const customers = generateCustomers(sizes.customers);
  tables.payment_methods = generatePaymentMethods();
  tables.delivery_methods = generateDeliveryMethods();
  tables.regions = generateRegions(sizes.regions);
  tables.delivery_region_payments = generateDeliveryRegionPayments(
    tables.delivery_methods,
    tables.regions,
    tables.payment_methods,
    sizes.delivery_region_payments
  );

  tables.delivery_addresses = generateDeliveryAddresses(
    tables.regions,
    sizes.delivery_addresses
  );

  const orders = generateOrders(
    customers,
    tables.delivery_region_payments,
    tables.delivery_addresses,
    sizes.orders
  );

  const usedCustomers = [
    ...new Set(orders.map(({ customer_id }) => customer_id)),
  ];

  const idMap = new Map();

  tables.customers = customers
    .filter((c) => usedCustomers.includes(c.id))
    .map((c, i) => {
      if (c.id !== i + 1) {
        const newId = i + 1;
        idMap.set(c.id, newId);
        return { ...c, id: newId };
      }
      return c;
    });

  tables.orders = orders.map((order) => ({
    ...order,
    customer_id: idMap.get(order.customer_id) ?? order.customer_id,
  }));

  tables.categories = generateCategories(sizes.categories);
  tables.products = generateProducts(tables.categories, sizes.products);
  tables.suppliers = generateSuppliers(sizes.suppliers);
  tables.warehouses = generateWarehouses(tables.regions, sizes.warehouses);

  tables.product_supplier_warehouse = _.sortBy(
    generateProductSupplierWarehouses(
      tables.products,
      tables.suppliers,
      tables.warehouses,
      sizes.product_supplier_warehouse,
      sizes.maxWarehousesPerProduct,
      sizes.maxProductsPerSupplier
    ),
    ["product_id", "supplier_id", "warehouse_id"]
  );

  tables.supplier_contacts = generateSupplierContacts(
    tables.suppliers,
    tables.suppliers.length * 1.3
  );

  tables.order_items = generateOrderItems(
    tables.orders,
    tables.product_supplier_warehouse,
    sizes.order_items
  );

  return tables;
}
