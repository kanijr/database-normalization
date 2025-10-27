export default function combineNF2(nf3Tables) {
  const { customers } = nf3Tables;

  const orders = nf3Tables.orders.map(
    ({
      payment_method_id,
      delivery_method_id,
      delivery_address_id,
      ...order
    }) => {
      const address = nf3Tables.addresses.find(
        (a) => a.id === delivery_address_id
      );
      const street = nf3Tables.streets.find((s) => s.id === address.street_id);
      const city = nf3Tables.cities.find((c) => c.id === street.city_id);
      const region = nf3Tables.regions.find(
        (r) => r.id === city.region_id
      ).region_name;

      const dm = nf3Tables.delivery_methods.find(
        (x) => x.id === delivery_method_id
      );
      const pm = nf3Tables.payment_methods.find(
        (x) => x.id === payment_method_id
      );
      const amount = nf3Tables.order_items
        .filter((orderItem) => orderItem.order_id === order.id)
        .reduce(
          (sum, orderItem) =>
            sum +
            Number(
              nf3Tables.products.find(
                (prod) => prod.id === orderItem.product_id
              ).price
            ) *
              Number(orderItem.quantity),
          0
        );

      return {
        ...order,
        payment_method: pm.method_name,
        payment_amount: amount,
        payment_fee: pm.payment_fee,
        delivery_method: dm.method_name,
        delivery_fee: dm.delivery_fee,
        delivery_region: region,
        delivery_city: city.city_name,
        delivery_street: street.street_name,
        delivery_house: address.building,
        delivery_apartment: address.apartment,
      };
    }
  );

  const products_stock = nf3Tables.product_supplier_warehouse.map((psw, i) => {
    const { id, category_id, ...pr } = nf3Tables.products.find(
      (x) => x.id === psw.product_id
    );
    pr.category_name = nf3Tables.categories.find(
      (x) => x.id === category_id
    ).category_name;
    const { supplier_name } = nf3Tables.suppliers.find(
      (x) => x.id === psw.supplier_id
    );
    const wa = nf3Tables.warehouses.find((w) => w.id === psw.warehouse_id);

    const address = nf3Tables.addresses.find((s) => s.id === wa.address_id);
    const street = nf3Tables.streets.find((s) => s.id === address.street_id);
    const city = nf3Tables.cities.find((c) => c.id === street.city_id);
    const region = nf3Tables.regions.find(
      (r) => r.id === city.region_id
    ).region_name;

    return {
      id: i + 1,
      ...pr,
      supplier_name,
      warehouse_name: wa.warehouse_name,
      warehouse_region: region,
      warehouse_city: city.city_name,
      warehouse_street: street.street_name,
      warehouse_building: address.building,
      warehouse_apartment: address.apartment,
      psw,
    };
  });

  const order_items = nf3Tables.order_items.map(
    ({ product_id, supplier_id, warehouse_id, ...order_items }) => {
      const { id } = products_stock.find(
        ({ psw }) =>
          psw.product_id === product_id &&
          psw.supplier_id === supplier_id &&
          psw.warehouse_id === warehouse_id
      );
      return {
        product_id: id,
        ...order_items,
      };
    }
  );

  products_stock.forEach((p) => {
    delete p.psw;
  });

  const supplier_contacts = nf3Tables.supplier_contacts.map(
    ({ supplier_id, ...contact }, i) => {
      const { supplier_name } = nf3Tables.suppliers.find(
        (s) => s.id === supplier_id
      );
      return {
        supplier_name,
        ...contact,
      };
    }
  );

  return {
    customers,
    orders,
    products_stock,
    supplier_contacts,
    order_items,
  };
}
