import {
  generateCustomers,
  generatePaymentMethods,
  generateDeliveryMethods,
  generateRegions,
  generateCities,
  generateStreets,
  generateOrders,
  generateCategories,
  generateWarehouses,
  generateSuppliers,
  generateProducts,
  generateProductSupplierWarehouses,
  generateOrderItems,
  generateSupplierContacts,
  generateAddresses,
} from "../entities/index.js";
import _ from "lodash";

export default function combineNF3(sizes) {
  const tables = {};

  tables.customers = generateCustomers(sizes.customers);
  tables.payment_methods = generatePaymentMethods();
  tables.delivery_methods = generateDeliveryMethods();

  tables.regions = generateRegions(sizes.regions);
  tables.cities = generateCities(tables.regions, sizes.cities);
  tables.streets = generateStreets(tables.cities, sizes.streets);
  tables.addresses = generateAddresses(tables.streets, sizes.addresses);

  tables.orders = generateOrders(
    tables.customers,
    tables.delivery_methods,
    tables.payment_methods,
    tables.addresses,
    sizes.orders
  );

  tables.categories = generateCategories(sizes.categories);
  tables.products = generateProducts(tables.categories, sizes.products);
  tables.suppliers = generateSuppliers(sizes.suppliers);
  tables.warehouses = generateWarehouses(tables.addresses, sizes.warehouses);

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

  tables.order_items = generateOrderItems(
    tables.orders,
    tables.product_supplier_warehouse,
    sizes.order_items
  );

  const usedOrders = new Set(
    tables.order_items.map(({ order_id }) => order_id)
  );

  tables.orders = tables.orders.filter((o) => usedOrders.has(o.id));

  const usedProd = new Set(
    tables.product_supplier_warehouse.map(({ product_id }) => product_id)
  );
  const usedSuppl = new Set(
    tables.product_supplier_warehouse.map(({ supplier_id }) => supplier_id)
  );
  const usedWare = new Set(
    tables.product_supplier_warehouse.map(({ warehouse_id }) => warehouse_id)
  );

  tables.products = tables.products.filter((p) => usedProd.has(p.id));
  tables.suppliers = tables.suppliers.filter((s) => usedSuppl.has(s.id));
  tables.supplier_contacts = generateSupplierContacts(tables.suppliers);
  tables.warehouses = tables.warehouses.filter((w) => usedWare.has(w.id));

  const usedCateg = new Set(
    tables.products.map(({ category_id }) => category_id)
  );

  tables.categories = tables.categories.filter((c) => usedCateg.has(c.id));

  const usedCustomers = new Set(
    tables.orders.map(({ customer_id }) => customer_id)
  );
  const usedPayMethod = new Set(
    tables.orders.map(({ payment_method_id }) => payment_method_id)
  );
  const usedDelivMethod = new Set(
    tables.orders.map(({ delivery_method_id }) => delivery_method_id)
  );

  tables.customers = tables.customers.filter((c) => usedCustomers.has(c.id));
  tables.payment_methods = tables.payment_methods.filter((p) =>
    usedPayMethod.has(p.id)
  );
  tables.delivery_methods = tables.delivery_methods.filter((d) =>
    usedDelivMethod.has(d.id)
  );

  const usedAddress = new Set([
    ...tables.orders.map(({ delivery_address_id }) => delivery_address_id),
    ...tables.warehouses.map(({ address_id }) => address_id),
  ]);
  tables.addresses = tables.addresses.filter((a) => usedAddress.has(a.id));

  const usedStreets = new Set(
    tables.addresses.map(({ street_id }) => street_id)
  );
  tables.streets = tables.streets.filter((s) => usedStreets.has(s.id));

  const usedCities = new Set(tables.streets.map(({ city_id }) => city_id));
  tables.cities = tables.cities.filter((c) => usedCities.has(c.id));

  const usedRegions = new Set(tables.cities.map(({ region_id }) => region_id));
  tables.regions = tables.regions.filter((r) => usedRegions.has(r.id));

  return tables;
}
