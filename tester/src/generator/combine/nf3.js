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

export default function combineNF3() {
  const tables = {};

  tables.customers = generateCustomers(500);
  tables.payment_methods = generatePaymentMethods();
  tables.delivery_methods = generateDeliveryMethods();
  tables.regions = generateRegions(27);
  tables.delivery_region_payments = generateDeliveryRegionPayments(
    tables.delivery_methods,
    tables.regions,
    tables.payment_methods,
    180
  );
  tables.delivery_addresses = generateDeliveryAddresses(tables.regions, 150);
  tables.orders = generateOrders(
    tables.customers,
    tables.delivery_region_payments,
    tables.delivery_addresses,
    800
  );
  tables.categories = generateCategories(35);

  // Кількість записів у product_supplier_warehouse
  const numPSW = 1000;

  tables.products = generateProducts(
    tables.categories,
    Math.min(150, Math.max(12, Math.floor(numPSW * 0.045)))
  );
  tables.suppliers = generateSuppliers(
    Math.min(150, Math.max(12, Math.floor(numPSW * 0.05)))
  );
  tables.warehouses = generateWarehouses(
    tables.regions,
    Math.max(10, Math.min(100, Math.floor(numPSW * 0.03)))
  );

  tables.product_supplier_warehouse = _.sortBy(
    generateProductSupplierWarehouses(
      tables.products,
      tables.suppliers,
      tables.warehouses,
      numPSW
    ),
    ["product_id", "supplier_id", "warehouse_id"]
  );

  tables.supplier_contacts = generateSupplierContacts(
    tables.suppliers,
    tables.suppliers.length * 1.5
  );

  tables.order_items = generateOrderItems(
    tables.orders,
    tables.product_supplier_warehouse,
    150
  );

  return tables;
}
